# Interactive Purchase Order Generator

A high-fidelity, interactive Purchase Order (PO) Builder built with React, Vite, and Vanilla CSS. It provides a real-time side-by-side editing dashboard and a paper-style invoice canvas that matches standard corporate purchasing designs exactly.

## Features

- **Side-by-side Layout**: Left-hand sidebar panel for document metadata, tax options, and global actions. Right-hand interactive canvas representing a live A4 sheet.
- **In-place Editing**: Modify all field details (Buyer/Vendor info, PO headers, items, terms) directly by typing on the document canvas.
- **Dynamic Calculation Engine**:
  - Automatically calculates item row totals on Qty/Rate changes.
  - Automatically computes Taxable Subtotal.
  - Smart GST Selector: Select standard tax rates (0%, 5%, 12%, 18%, 28%) and choose tax structures (IGST or CGST/SGST).
  - Smart Place of Supply Routing: Automatically shifts between IGST and CGST+SGST when the "Place of Supply" matches the buyer's home state (Maharashtra).
- **Indian Rupee Word Conversion**: Integrates an Indian number-to-words utility to automatically spell out the Grand Total (e.g. *Thirty Two Thousand Eight Hundred Fifty One Rupees and Twenty Paise Only*).
- **High-Fidelity PDF Generation**: Triggers print layout styles (`@media print`) that format the sheet for a clean A4 layout, hiding toolbars, outlines, control options, and item actions when printing or saving as a PDF.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (custom properties, print-media configurations)
- **Icons**: Lucide React

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git install
npm install
```

### Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Build for Production

Build the production bundle:

```bash
npm run build
```

## PDF Export / Printing Guide

To save your purchase order as a clean, high-resolution PDF document:

1. Click the **"Print / Download PDF"** button in the sidebar (or press `Ctrl+P`/`Cmd+P`).
2. In the browser print dialog:
   - Set **Destination** to **Save as PDF**.
   - Set **Layout** to **Portrait**.
   - Check **Headers and Footers** as **Off/Disabled**.
   - Set **Margins** to **Default** or **None**.
   - Enable **Background graphics** to ensure header blocks, gray tables, and total highlight banners print correctly.
3. Click **Save**.
