import React, { useState, useMemo, useEffect } from 'react';
import { numberToWords } from './utils/numberToWords';
import { 
  Plus, 
  Trash2, 
  Printer, 
  RefreshCw, 
  FileText,
  DollarSign,
  Percent,
  Settings,
  HelpCircle,
  FileDown
} from 'lucide-react';

const INITIAL_BUYER = {
  name: "Mirai Technologies",
  address: "Mumbai, Maharashtra, India",
  gstin: "27DEHPB4168C1ZR"
};

const INITIAL_VENDOR = {
  name: "Arihant Electricals",
  address: "ECOTECH-XII, 060, Greater Noida,\nGautam Buddha Nagar,\nUttar Pradesh - 201308",
  gstin: "09AAAFA2753N1ZB",
  partners: "Amit Jain / Beenu Jain"
};

const parseNumber = (val) => {
  if (val === null || val === undefined) return 0;
  const str = val.toString().replace(/,/g, '').trim();
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

const INITIAL_ITEMS = [
  {
    id: '1',
    partNumber: "B32529C0474J289",
    description: "TDK/EPCOS I Film Capacitor 0.47uF 630V AC I MKT Radial I Series B32529C",
    hsn: "85322900",
    qty: "4,800",
    unit: "PCS",
    rate: "5.80"
  }
];

const INITIAL_TERMS = [
  "Please confirm receipt of this PO and provide order acknowledgement with expected delivery date.",
  "All goods must be 100% original, factory-new and traceable to manufacturer. No counterfeit or refurbished goods.",
  "Goods must be properly packed and labelled. Invoice must mention this PO number.",
  "IGST @ 18% applicable as per GST regulations (Inter-state supply).",
  "Payment will be processed as per mutually agreed payment terms upon satisfactory receipt of goods.",
  "Mirai Technologies reserves the right to reject non-conforming goods at vendor's cost.",
  "Subject to Mumbai, Maharashtra jurisdiction."
];

function App() {
  const [poNumber, setPoNumber] = useState("PO/MIR/2526/0361");
  const [date, setDate] = useState("11 Jun 2026");
  const [currency, setCurrency] = useState("INR (Indian Rupee)");
  const [placeOfSupply, setPlaceOfSupply] = useState("Uttar Pradesh (09)");
  
  const [buyer, setBuyer] = useState(INITIAL_BUYER);
  const [vendor, setVendor] = useState(INITIAL_VENDOR);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [gstRate, setGstRate] = useState(18);
  const [taxType, setTaxType] = useState("IGST"); // IGST, CGST+SGST, UTGST, NONE
  const [terms, setTerms] = useState(INITIAL_TERMS);

  // Custom tax overrides
  const [customIgst, setCustomIgst] = useState(null);
  const [customCgst, setCustomCgst] = useState(null);
  const [customSgst, setCustomSgst] = useState(null);

  // Reset overrides when rate or type changes
  useEffect(() => {
    setCustomIgst(null);
    setCustomCgst(null);
    setCustomSgst(null);
  }, [gstRate, taxType]);

  // Synchronize taxType automatic default or terms update
  useEffect(() => {
    // If place of supply contains "Maharashtra", let's suggest CGST+SGST, else IGST
    if (placeOfSupply.toLowerCase().includes("maharashtra")) {
      setTaxType("CGST+SGST");
    } else {
      setTaxType("IGST");
    }
  }, [placeOfSupply]);

  // Sync terms GST message if it exists
  useEffect(() => {
    setTerms(prevTerms => {
      return prevTerms.map(term => {
        if (term.includes("GST regulations")) {
          const typeStr = taxType === "CGST+SGST" ? "CGST @ 9% & SGST @ 9%" : `IGST @ ${gstRate}%`;
          const supplyStr = taxType === "CGST+SGST" ? "Intra-state supply" : "Inter-state supply";
          return `${typeStr} applicable as per GST regulations (${supplyStr}).`;
        }
        return term;
      });
    });
  }, [taxType, gstRate]);

  // Format currency helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Calculations
  const calculations = useMemo(() => {
    const taxableAmount = items.reduce((sum, item) => {
      const qty = parseNumber(item.qty);
      const rate = parseNumber(item.rate);
      return sum + (qty * rate);
    }, 0);

    let taxRows = [];
    let orderTotal = taxableAmount;

    if (taxType === "IGST") {
      const autoIgst = Math.round(taxableAmount * (gstRate / 100) * 100) / 100;
      const igstAmount = customIgst !== null ? parseFloat(customIgst) || 0 : autoIgst;
      taxRows.push({
        label: `IGST @ ${gstRate}%:`,
        value: igstAmount,
        isOverride: customIgst !== null,
        setValue: setCustomIgst
      });
      orderTotal += igstAmount;
    } else if (taxType === "CGST+SGST") {
      const halfRate = gstRate / 2;
      const autoCgst = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
      const autoSgst = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
      const cgstAmount = customCgst !== null ? parseFloat(customCgst) || 0 : autoCgst;
      const sgstAmount = customSgst !== null ? parseFloat(customSgst) || 0 : autoSgst;
      
      taxRows.push({
        label: `CGST @ ${halfRate}%:`,
        value: cgstAmount,
        isOverride: customCgst !== null,
        setValue: setCustomCgst
      });
      taxRows.push({
        label: `SGST @ ${halfRate}%:`,
        value: sgstAmount,
        isOverride: customSgst !== null,
        setValue: setCustomSgst
      });
      orderTotal += (cgstAmount + sgstAmount);
    }

    return {
      taxableAmount,
      taxRows,
      orderTotal,
      amountInWords: numberToWords(orderTotal)
    };
  }, [items, gstRate, taxType, customIgst, customCgst, customSgst]);

  // Handlers
  const handleItemChange = (id, field, value) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItemRow = () => {
    const newId = (items.length + 1).toString();
    setItems([
      ...items,
      {
        id: newId,
        partNumber: "",
        description: "",
        hsn: "",
        qty: 1,
        unit: "PCS",
        rate: 0
      }
    ]);
  };

  const removeItemRow = (id) => {
    if (items.length === 1) {
      alert("At least one item is required in the Purchase Order.");
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleTermChange = (index, value) => {
    const updated = [...terms];
    updated[index] = value;
    setTerms(updated);
  };

  const addTerm = () => {
    setTerms([...terms, "New terms and condition line."]);
  };

  const removeTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to the original template values?")) {
      setPoNumber("PO/MIR/2526/0361");
      setDate("11 Jun 2026");
      setCurrency("INR (Indian Rupee)");
      setPlaceOfSupply("Uttar Pradesh (09)");
      setBuyer(INITIAL_BUYER);
      setVendor(INITIAL_VENDOR);
      setItems(INITIAL_ITEMS);
      setGstRate(18);
      setTaxType("IGST");
      setTerms(INITIAL_TERMS);
      setCustomIgst(null);
      setCustomCgst(null);
      setCustomSgst(null);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Control Panel */}
      <aside className="control-sidebar print-hide">
        <div>
          <h2 className="sidebar-title">PO Generator</h2>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time Editable Purchase Order Builder</p>
        </div>

        <div className="sidebar-section">
          <h3>Document Metadata</h3>
          
          <div className="control-group">
            <label>PO Number</label>
            <input 
              type="text" 
              className="control-input" 
              value={poNumber} 
              onChange={e => setPoNumber(e.target.value)} 
            />
          </div>

          <div className="control-group">
            <label>Date</label>
            <input 
              type="text" 
              className="control-input" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
            />
          </div>

          <div className="control-group">
            <label>Currency</label>
            <input 
              type="text" 
              className="control-input" 
              value={currency} 
              onChange={e => setCurrency(e.target.value)} 
            />
          </div>

          <div className="control-group">
            <label>Place of Supply</label>
            <input 
              type="text" 
              className="control-input" 
              value={placeOfSupply} 
              onChange={e => setPlaceOfSupply(e.target.value)} 
              placeholder="e.g. Uttar Pradesh (09)"
            />
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Tax Configuration</h3>
          
          <div className="control-group">
            <label>GST Rate (%)</label>
            <select 
              className="control-select" 
              value={gstRate} 
              onChange={e => setGstRate(Number(e.target.value))}
            >
              <option value={0}>0% (Exempt)</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18% (Standard)</option>
              <option value={28}>28%</option>
            </select>
          </div>

          <div className="control-group">
            <label>Tax Type</label>
            <select 
              className="control-select" 
              value={taxType} 
              onChange={e => setTaxType(e.target.value)}
            >
              <option value="IGST">IGST (Inter-state)</option>
              <option value="CGST+SGST">CGST + SGST (Intra-state)</option>
              <option value="NONE">No Tax</option>
            </select>
          </div>
        </div>

        <div className="sidebar-section" style={{ marginTop: 'auto', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print / Download PDF
          </button>
          
          <button className="btn btn-secondary" onClick={handleReset}>
            <RefreshCw size={14} /> Reset Template
          </button>
        </div>
      </aside>

      {/* Main Preview / Edit Sheet */}
      <main className="preview-area">
        <div className="invoice-sheet" id="po-invoice-sheet">
          
          {/* Header */}
          <div className="invoice-header">
            <div className="header-left">
              <h1>MIRAI <span>TECHNOLOGIES</span></h1>
              <div className="gst-line">
                GSTIN: <strong>{buyer.gstin}</strong> | Mumbai, Maharashtra
              </div>
            </div>
            <div className="header-right">
              <div className="po-title">Purchase Order</div>
              <div className="sub-header-right">Electronics Components & Semiconductor Distribution</div>
            </div>
          </div>

          {/* PO Metadata Box */}
          <div className="po-details-box">
            <div className="details-row">
              <div className="details-cell">
                <span className="cell-label">PO Number:</span>
                <input 
                  type="text" 
                  className="cell-val-input" 
                  value={poNumber} 
                  onChange={e => setPoNumber(e.target.value)} 
                />
              </div>
              <div className="details-cell">
                <span className="cell-label">Date:</span>
                <input 
                  type="text" 
                  className="cell-val-input" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
              </div>
            </div>
            <div className="details-row">
              <div className="details-cell">
                <span className="cell-label">Currency:</span>
                <input 
                  type="text" 
                  className="cell-val-input" 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)} 
                />
              </div>
              <div className="details-cell">
                <span className="cell-label">Place of Supply:</span>
                <input 
                  type="text" 
                  className="cell-val-input" 
                  value={placeOfSupply} 
                  onChange={e => setPlaceOfSupply(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Buyer & Vendor Columns */}
          <div className="info-section">
            <div className="buyer-box">
              <div className="info-title">Buyer</div>
              <input 
                type="text" 
                className="company-name-input" 
                value={buyer.name} 
                onChange={e => setBuyer({ ...buyer, name: e.target.value })} 
                placeholder="Buyer Company Name"
              />
              <textarea 
                className="editable-textarea" 
                rows={3}
                value={buyer.address} 
                onChange={e => setBuyer({ ...buyer, address: e.target.value })} 
                placeholder="Buyer Address"
              />
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                GSTIN: <input 
                  type="text" 
                  style={{ fontWeight: 'bold', width: '120px', border: '1px dashed transparent', padding: '1px' }}
                  value={buyer.gstin} 
                  onChange={e => setBuyer({ ...buyer, gstin: e.target.value })} 
                />
              </div>
            </div>

            <div className="vendor-box">
              <div className="info-title">Vendor</div>
              <input 
                type="text" 
                className="company-name-input" 
                value={vendor.name} 
                onChange={e => setVendor({ ...vendor, name: e.target.value })} 
                placeholder="Vendor Company Name"
              />
              <textarea 
                className="editable-textarea" 
                rows={4}
                value={vendor.address} 
                onChange={e => setVendor({ ...vendor, address: e.target.value })} 
                placeholder="Vendor Address"
              />
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                GSTIN: <input 
                  type="text" 
                  style={{ fontWeight: 'bold', width: '120px', border: '1px dashed transparent', padding: '1px' }}
                  value={vendor.gstin} 
                  onChange={e => setVendor({ ...vendor, gstin: e.target.value })} 
                />
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Partners: <input 
                  type="text" 
                  style={{ border: '1px dashed transparent', width: '150px' }}
                  value={vendor.partners} 
                  onChange={e => setVendor({ ...vendor, partners: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Part Number / Description</th>
                <th style={{ width: '100px' }}>HSN</th>
                <th style={{ width: '80px' }}>Qty</th>
                <th style={{ width: '60px' }}>Unit</th>
                <th style={{ width: '90px' }}>Rate (₹)</th>
                <th style={{ width: '110px' }}>Amount (₹)</th>
                <th className="print-hide" style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const qty = parseNumber(item.qty);
                const rate = parseNumber(item.rate);
                const rowAmount = qty * rate;

                return (
                  <tr key={item.id} className="item-row">
                    <td className="col-center" style={{ verticalAlign: 'middle' }}>{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        className="table-input desc-title-input" 
                        value={item.partNumber} 
                        onChange={e => handleItemChange(item.id, 'partNumber', e.target.value)}
                        placeholder="Part Number"
                      />
                      <textarea 
                        className="table-input desc-details-input" 
                        rows={2}
                        value={item.description} 
                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Description details"
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input 
                        type="text" 
                        className="table-input col-center" 
                        value={item.hsn} 
                        onChange={e => handleItemChange(item.id, 'hsn', e.target.value)}
                        placeholder="HSN"
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input 
                        type="text" 
                        className="table-input col-right" 
                        value={item.qty} 
                        onChange={e => handleItemChange(item.id, 'qty', e.target.value)}
                        onFocus={e => {
                          const raw = e.target.value.replace(/,/g, '');
                          handleItemChange(item.id, 'qty', raw);
                        }}
                        onBlur={e => {
                          const num = parseNumber(e.target.value);
                          const formatted = num % 1 === 0 
                            ? new Intl.NumberFormat('en-IN').format(num)
                            : new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 3 }).format(num);
                          handleItemChange(item.id, 'qty', formatted);
                        }}
                        placeholder="0"
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input 
                        type="text" 
                        className="table-input col-center" 
                        value={item.unit} 
                        onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                        placeholder="PCS"
                      />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input 
                        type="text" 
                        className="table-input col-right" 
                        value={item.rate} 
                        onChange={e => handleItemChange(item.id, 'rate', e.target.value)}
                        onFocus={e => {
                          const raw = e.target.value.replace(/,/g, '');
                          handleItemChange(item.id, 'rate', raw);
                        }}
                        onBlur={e => {
                          const num = parseNumber(e.target.value);
                          const formatted = new Intl.NumberFormat('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(num);
                          handleItemChange(item.id, 'rate', formatted);
                        }}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="col-right" style={{ verticalAlign: 'middle', fontWeight: '500' }}>
                      {formatCurrency(rowAmount)}
                    </td>
                    <td className="row-actions-td print-hide">
                      <button 
                        className="delete-row-btn"
                        onClick={() => removeItemRow(item.id)}
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Add Row Button (Print Hidden) */}
          <div className="add-row-container print-hide">
            <button className="btn btn-secondary btn-sm" onClick={addItemRow}>
              <Plus size={14} /> Add Item Row
            </button>
          </div>

          {/* Summary / Calculations */}
          <div className="summary-container">
            <div className="summary-row">
              <span className="cell-label">Taxable Amount:</span>
              <span>₹ {formatCurrency(calculations.taxableAmount)}</span>
            </div>
            
            {calculations.taxRows.map((tax, i) => (
              <div className="summary-row" key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span className="cell-label" style={{ marginRight: 'auto' }}>{tax.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>₹</span>
                  <input 
                    type="text" 
                    className="table-input col-right" 
                    style={{ 
                      width: '90px', 
                      fontWeight: tax.isOverride ? '700' : '500',
                      color: tax.isOverride ? 'var(--primary-color)' : 'inherit',
                      padding: '2px 4px',
                      borderBottom: '1px dashed var(--invoice-border)'
                    }}
                    value={tax.isOverride ? tax.value : formatCurrency(tax.value).replace(/,/g, '')}
                    onChange={e => {
                      const val = e.target.value;
                      tax.setValue(val);
                    }}
                    onFocus={e => {
                      const raw = e.target.value.replace(/,/g, '');
                      tax.setValue(raw);
                    }}
                    onBlur={e => {
                      if (e.target.value === '') {
                        tax.setValue(null);
                      } else {
                        const num = parseNumber(e.target.value);
                        tax.setValue(num.toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                  />
                  {tax.isOverride && (
                    <button 
                      className="print-hide" 
                      style={{ 
                        border: 'none', 
                        background: '#f1f5f9', 
                        cursor: 'pointer', 
                        color: '#6b7280', 
                        fontSize: '9px',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        marginLeft: '2px'
                      }}
                      onClick={() => tax.setValue(null)}
                      title="Reset to automatic calculation"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="summary-row total-bar">
              <span>ORDER TOTAL:</span>
              <span>₹ {formatCurrency(calculations.orderTotal)}</span>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="words-container">
            <strong>Amount in Words:</strong> <span>{calculations.amountInWords}</span>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <h3>Terms & Conditions</h3>
            <ul className="terms-list">
              {terms.map((term, index) => (
                <li key={index} className="terms-item">
                  <span style={{ fontSize: '11px', color: '#4b5563', padding: '2px 0' }}>{index + 1}.</span>
                  <input 
                    type="text" 
                    className="terms-item-input" 
                    value={term} 
                    onChange={e => handleTermChange(index, e.target.value)}
                  />
                  <button 
                    className="delete-term-btn print-hide"
                    onClick={() => removeTerm(index)}
                    title="Remove Term"
                  >
                    <Trash2 size={10} />
                  </button>
                </li>
              ))}
            </ul>
            <button 
              className="btn btn-secondary print-hide add-term-btn" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '10px', marginTop: '0.5rem' }} 
              onClick={addTerm}
            >
              <Plus size={10} /> Add Term
            </button>
          </div>

          {/* Signatures */}
          <div className="sig-container">
            <div className="sig-box">
              <div style={{ fontWeight: '700' }}>For {buyer.name}</div>
              <div className="sig-line">Authorised Signatory</div>
            </div>
          </div>

          {/* Revert instructions & Footer */}
          <div className="invoice-footer">
            <div className="revert-msg">
              <span>Please revert with order acknowledgement & tax invoice to:</span>
              <strong>{buyer.name} | {buyer.address.split('\n')[0]} | GSTIN: {buyer.gstin}</strong>
            </div>
            <div className="footer-credits">
              {buyer.name} | Mumbai, India | GSTIN: {buyer.gstin}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
