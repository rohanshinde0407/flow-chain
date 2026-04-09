import * as React from "react"

/* ─────────────────────────────────────────────────────────────
   FlowChain Advanced Data Table System
   • Dark gradient sticky header
   • 6px gap between rows via border-spacing: 0 6px
   • Each row has subtle border-radius + shadow for card feel
   • Zebra + hover highlights via .fc-tbody CSS in index.css
   • Parent .fc-table-container owns the card border/shadow
───────────────────────────────────────────────────────────── */

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div style={{
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
    padding: '0 8px',           /* side padding so row shadows aren't clipped */
    boxSizing: 'border-box',
  }}>
    <table
      ref={ref}
      className={className || ''}
      style={{
        borderCollapse: 'separate',
        borderSpacing: '0 5px',   /* ← creates the row gap */
        width: '100%',
        minWidth: 'max-content',
        tableLayout: 'auto',
        paddingTop: '4px',
      }}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={className}
    style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`fc-tbody ${className || ''}`}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={className}
    style={{ background: '#f8fafc', borderTop: '1px solid #e8ecf0', fontWeight: 600 }}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`fc-table-row ${className || ''}`}
    style={{
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, style, ...props }, ref) => (
  <th
    ref={ref}
    className={className}
    style={{
      height: '2.875rem',
      padding: '0 1rem',
      textAlign: 'center',
      verticalAlign: 'middle',
      fontSize: '0.62rem',
      fontWeight: 800,
      color: 'rgba(255,255,255,0.78)',
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      whiteSpace: 'nowrap',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      userSelect: 'none',
      ...style
    }}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, style, ...props }, ref) => (
  <td
    ref={ref}
    className={className}
    style={{
      padding: '0.75rem 1rem',
      verticalAlign: 'middle',
      textAlign: 'center',
      fontSize: '0.82rem',
      color: '#334155',
      borderRight: '1px solid #f0f3f7',
      /* first and last cells get rounded corners to match the row */
      ...style
    }}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={className}
    style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
