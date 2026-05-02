# OpThemis

Industrial Energy & Lifecycle Optimization Platform  
Built for opthemis.ch · EPFL Startup Launchpad 2025

---

## Project structure

```
Opthemis/
├── frontend/          React app (Vite)
│   └── src/
│       ├── pages/     Login, Overview, Procurement, Manufacturing, Logistics, Results
│       └── components/Layout.jsx
├── api/               Azure Functions (Python)
│   ├── function_app.py   3 functions: factory_data, milp_solver, ai_assistant
│   └── requirements.txt
└── staticwebapp.config.json
```

---

## Local development

### 1. Start the frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Start the API (in a second terminal)
```bash
cd api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
func start
# → http://localhost:7071/api/
```

### 3. Set your Anthropic API key (local)
Edit `api/local.settings.json`:
```json
{
  "Values": {
    "ANTHROPIC_API_KEY": "sk-ant-..."
  }
}
```

---

## Deploy to Azure

### One-time setup
```bash
# Create Static Web App (connects to GitHub for auto-deploy)
az staticwebapp create \
  --name opthemis-web \
  --resource-group opthemis-rg \
  --location westeurope \
  --sku Free \
  --source https://github.com/YOUR_USERNAME/opthemis \
  --branch main \
  --app-location "/frontend" \
  --api-location "/api" \
  --output-location "dist"
```

### Set secret environment variables
```bash
az staticwebapp appsettings set \
  --name opthemis-web \
  --resource-group opthemis-rg \
  --setting-names ANTHROPIC_API_KEY=sk-ant-...
```

### Connect opthemis.ch domain
1. In Azure portal → Static Web App → Custom domains → Add
2. Add CNAME record at your domain registrar:
   - Type: CNAME
   - Name: www  (or @)
   - Value: [your-app].azurestaticapps.net

---

## Environment variables needed

| Variable | Where | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Azure app settings | For AI assistant |
| `COSMOS_CONNECTION` | Azure app settings | (future) database |

---

## Roadmap

- [x] Role-based data entry (procurement, manufacturing, logistics)
- [x] MILP optimization engine (Python, scipy-based)
- [x] AI assistant (Claude via Anthropic API)
- [x] Lifecycle CO₂ tracking (Scope 1+2+3)
- [ ] Cosmos DB persistence
- [ ] Azure Databricks for full MILP (heavy jobs)
- [ ] AnyLogic logistics API integration
- [ ] Excel file upload + auto-parse
- [ ] Multi-factory / multi-tenant support
