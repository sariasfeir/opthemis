import azure.functions as func
import json
import logging
import os
import math

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# ─────────────────────────────────────────
# 1. FACTORY DATA  —  save / load stage data
# ─────────────────────────────────────────
@app.route(route="factory_data", methods=["GET", "POST"])
def factory_data(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("factory_data called")

    if req.method == "POST":
        try:
            body = req.get_json()
            stage = body.get("stage")
            data  = body.get("data")
            # TODO: persist to Cosmos DB
            # For now, echo back success
            return func.HttpResponse(
                json.dumps({"status": "saved", "stage": stage}),
                mimetype="application/json", status_code=200
            )
        except Exception as e:
            return func.HttpResponse(
                json.dumps({"error": str(e)}),
                mimetype="application/json", status_code=400
            )

    # GET — return placeholder
    return func.HttpResponse(
        json.dumps({"status": "ok", "message": "OpThemis API running"}),
        mimetype="application/json"
    )


# ─────────────────────────────────────────
# 2. MILP SOLVER  —  run energy optimization
# ─────────────────────────────────────────
@app.route(route="milp_solver", methods=["POST"])
def milp_solver(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("milp_solver called")
    try:
        body = req.get_json()
        mfg  = body.get("manufacturing", {})
        proc = body.get("procurement", {})
        logi = body.get("logistics", {})

        # Pull inputs with defaults (matching thesis values)
        electricity  = float(mfg.get("electricity",  1620))
        grid_co2     = float(mfg.get("grid_co2",      437))
        pv_area      = float(mfg.get("pv_area",       250))
        target_year  = mfg.get("target_year", "2025")
        steam_kw     = float(mfg.get("steam",         180))
        elec_cost    = float(mfg.get("elec_cost",      85))

        # Grid decarbonisation factor
        grid_mult = {"2030": 0.7, "2035": 0.5}.get(target_year, 1.0)

        # ── Baseline ──────────────────────────
        baseline_co2  = round(electricity * grid_co2 / 1000, 1)   # tCO2/y
        baseline_cost = round(electricity * elec_cost / 1000, 1)   # kCHF/y

        # ── Scenario 1: heat recovery ─────────
        hr_co2_red  = round(steam_kw * 0.6 * grid_co2 * grid_mult / 1e6 * 8760, 1)
        hr_savings  = round(hr_co2_red * elec_cost / grid_co2, 1)
        hr_capex    = round(hr_co2_red * 0.08, 1)

        # ── Scenario 2: heat pump ─────────────
        hp_cop      = 3.5
        hp_co2_red  = round(steam_kw * (1 - 1/hp_cop) * grid_co2 * grid_mult / 1e6 * 8760, 1)
        hp_savings  = round(steam_kw * (1 - 1/hp_cop) * elec_cost / 1e6 * 8760, 1)
        hp_capex    = round(steam_kw * 0.025, 1)

        # ── Scenario 3: HP + PV ───────────────
        pv_kwp      = pv_area * 0.165               # ~165 W/m²
        pv_kwh_y    = pv_kwp * 1450 * 0.8          # Thai irradiation
        pv_co2_red  = round(pv_kwh_y * grid_co2 * grid_mult / 1e6, 1)
        pv_savings  = round(pv_kwh_y * elec_cost / 1e6, 1)
        pv_capex    = round(pv_kwp * 0.9, 1)        # ~0.9 kCHF/kWp installed
        combined_co2_red = round(hp_co2_red + pv_co2_red, 1)
        combined_savings = round(hp_savings + pv_savings, 1)
        combined_capex   = round(hp_capex + pv_capex, 1)
        payback     = round(combined_capex / combined_savings, 1) if combined_savings > 0 else None

        # ── Scenario 4: HP + PV (future grid) ─
        future_co2_red = round(electricity * grid_co2 * (1 - grid_mult) * 0.8 / 1000, 1)
        future_pct     = round(future_co2_red / baseline_co2 * 100, 1) if baseline_co2 else 0

        # ── Scope breakdown ───────────────────
        proc_co2    = float(proc.get("annual_volume", 1240)) * float(proc.get("co2_cert", 2.8)) / 1000
        dist_vol    = float(logi.get("avg_distance", 850)) * float(mfg.get("production", 4814))
        dist_co2    = dist_vol * float(logi.get("truck_co2", 0.096)) / 1000
        scope1      = round(baseline_co2 * 0.42, 1)
        scope2      = round(baseline_co2 * 0.51, 1)
        scope3      = round(proc_co2 + dist_co2, 1)
        total_co2   = scope1 + scope2 + scope3

        result = {
            "baseline": {
                "co2_tpy": baseline_co2,
                "cost_kchf": baseline_cost,
            },
            "scenarios": [
                {
                    "name": "Heat recovery",
                    "co2_reduction_tpy": hr_co2_red,
                    "pct_reduction": round(hr_co2_red / baseline_co2 * 100, 1),
                    "annual_savings_kchf": hr_savings,
                    "capex_kchf": hr_capex,
                    "timeline": "Month 1–2",
                },
                {
                    "name": "Heat pump (20/65°C)",
                    "co2_reduction_tpy": hp_co2_red,
                    "pct_reduction": round(hp_co2_red / baseline_co2 * 100, 1),
                    "annual_savings_kchf": hp_savings,
                    "capex_kchf": hp_capex,
                    "timeline": "Month 3",
                },
                {
                    "name": f"HP + PV {int(pv_area)}m²",
                    "co2_reduction_tpy": combined_co2_red,
                    "pct_reduction": round(combined_co2_red / baseline_co2 * 100, 1),
                    "annual_savings_kchf": combined_savings,
                    "capex_kchf": combined_capex,
                    "payback_years": payback,
                    "timeline": "Month 5",
                },
                {
                    "name": f"HP + PV ({target_year} grid)",
                    "co2_reduction_tpy": combined_co2_red + future_co2_red,
                    "pct_reduction": future_pct,
                    "annual_savings_kchf": combined_savings,
                    "capex_kchf": combined_capex,
                    "timeline": target_year,
                },
            ],
            "scope_breakdown": {
                "scope1_tpy": scope1,
                "scope2_tpy": scope2,
                "scope3_tpy": scope3,
                "total_tpy": round(total_co2, 1),
            },
            "best_config": f"HP + PV {int(pv_area)}m²",
        }

        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"milp_solver error: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json", status_code=500
        )


# ─────────────────────────────────────────
# 3. AI ASSISTANT  —  proxy to Anthropic
# ─────────────────────────────────────────
@app.route(route="ai_assistant", methods=["POST"])
def ai_assistant(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("ai_assistant called")
    try:
        import anthropic
        body    = req.get_json()
        messages = body.get("messages", [])
        context  = body.get("context", {})

        system_prompt = f"""You are the OpThemis AI assistant — an expert in industrial energy optimization,
exergy analysis, pinch analysis, and lifecycle emissions reduction.

Factory context: {json.dumps(context)}

Be concise, practical, and engineering-accurate. When relevant, mention OpThemis capabilities.
"""
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        client  = anthropic.Anthropic(api_key=api_key)
        resp    = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system_prompt,
            messages=messages,
        )
        reply = resp.content[0].text

        return func.HttpResponse(
            json.dumps({"reply": reply}),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"ai_assistant error: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json", status_code=500
        )
