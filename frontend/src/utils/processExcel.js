import * as XLSX from 'xlsx'

function normalizeKey(label) {
  if (typeof label !== 'string') return label
  return label
    .trim()
    .toLowerCase()
    .replace(/[()\[\]\-]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function createRowObject(header, row) {
  const item = {}
  header.forEach((key, index) => {
    item[key] = row[index] === undefined ? null : row[index]
  })
  return item
}

function getStreamMass(row) {
  return parseNumber(row.stream_mass_kg ?? row.stream_mass ?? row.stream_mass_kg_ ?? row.stream_mass_kg__)
}

function getStreamDirection(row) {
  const value = row.stream_direction || row.direction || row.streamdirection || row.stream_direction_ || ''
  if (!value) return null
  const text = String(value).trim().toLowerCase()
  if (text.startsWith('in')) return 'in'
  if (text.startsWith('out')) return 'out'
  return text
}

function parseSheetData(sheet, sheetName) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, blankrows: false })
  if (!rows || rows.length < 2) return null

  const rawHeader = rows[0].map(cell => (cell == null ? '' : String(cell)))
  const header = rawHeader.map(normalizeKey)
  const data = rows.slice(1).map(row => createRowObject(header, row))

  const entries = data.filter(row => Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== ''))
  const parsedRows = entries.map(row => {
    const mass = getStreamMass(row)
    return {
      subprocess: row.subprocess || sheetName,
      unit: row.unit || null,
      unit_ref: row.unit_ref_on_pfd || row.unit_ref || null,
      unit_temperature_c: parseNumber(row.unit_temperature_c),
      unit_relative_pressure_mpa: parseNumber(row.unit_relative_pressure_mpa),
      unit_residence_time_min: parseNumber(row.unit_residence_time_min),
      unit_batch_capacity: parseNumber(row.unit_batch_capacity),
      stream: row.stream || null,
      stream_ref: row.stream_ref_on_pfd || row.stream_ref || null,
      stream_layer: row.stream_layer || null,
      stream_direction: getStreamDirection(row),
      stream_mass_kg: mass,
      stream_temperature_c: parseNumber(row.stream_temperature_c),
      stream_electrical_power_kw: parseNumber(row.stream_electrical_power_kw),
      stream_specific_mass_flow_kg_per_kgproduct: parseNumber(row.stream_specific_mass_flow_per_unit_kgkgproduct ?? row.stream_specific_mass_flow_per_unit_kgkgproduct),
      stream_continuous_mass_flow_kg_s: parseNumber(row.stream_continous_mass_flow_kg_s ?? row.stream_continuous_mass_flow_kg_s),
      stream_cp_kj_kg_k: parseNumber(row.stream_cp_kj_kg_k ?? row.stream_cp_kjk_gk),
      stream_initial_moisture_content_pct: parseNumber(row.stream_initial_moisture_content),
      stream_final_moisture_content_pct: parseNumber(row.stream_final_moisture_content),
      stream_relative_pressure_mpa: parseNumber(row.stream_relative_pressure_mpa),
      water_mass_content: parseNumber(row.water_mass_content),
      gantt_start: parseNumber(row.gantt_start),
      gantt_stop: parseNumber(row.gantt_stop),
      raw: row,
    }
  })

  const inputMass = parsedRows.filter(r => r.stream_direction === 'in').reduce((sum, r) => sum + (r.stream_mass_kg || 0), 0)
  const outputMass = parsedRows.filter(r => r.stream_direction === 'out').reduce((sum, r) => sum + (r.stream_mass_kg || 0), 0)
  const balance = outputMass - inputMass
  const utilities = parsedRows.filter(r => {
    const layer = String(r.stream_layer || '').toLowerCase()
    const stream = String(r.stream || '').toLowerCase()
    return layer.includes('steam') || layer.includes('electricity') || stream.includes('electricity')
  })

  return {
    name: sheetName,
    headers: rawHeader,
    rows: parsedRows,
    inputMass,
    outputMass,
    balance,
    utilities: utilities.length,
    rowCount: parsedRows.length,
  }
}

export async function parseProcessWorkbook(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets = []

  workbook.SheetNames.forEach(sheetName => {
    const skip = ['lookup', 'pressures']
    if (skip.includes(sheetName.trim().toLowerCase())) return
    const worksheet = workbook.Sheets[sheetName]
    const sheetData = parseSheetData(worksheet, sheetName)
    if (sheetData) sheets.push(sheetData)
  })

  return {
    fileName: file.name,
    sheets,
  }
}
