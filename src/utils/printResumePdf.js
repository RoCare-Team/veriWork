export function printResumePdf() {
  const resume = document.getElementById('veriwork-public-resume')
  if (!resume) return

  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) {
    window.print()
    return
  }

  const styles = `
    * { box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 24px; color: #1e293b; }
    h1 { font-size: 24px; margin: 0; }
    h2 { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #005fd6; border-bottom: 2px solid #005fd6; padding-bottom: 4px; }
    img { object-fit: cover; border-radius: 12px; }
    .score-box { background: linear-gradient(135deg, #005fd6, #0073fe); color: white; border-radius: 12px; padding: 12px 16px; text-align: center; }
  `

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>PagerLook Resume</title>
        <style>${styles}</style>
      </head>
      <body>${resume.outerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => {
    printWindow.print()
    printWindow.onafterprint = () => printWindow.close()
  }
}
