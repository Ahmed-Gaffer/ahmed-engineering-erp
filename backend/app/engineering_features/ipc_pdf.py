from io import BytesIO
from decimal import Decimal
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    Image as RLImage, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.barcode import qr
import arabic_reshaper
from bidi.algorithm import get_display
from datetime import datetime
from .models import IPCHeader, IPCDetail

FONT_DIR = Path(__file__).parent / "fonts"
FONT_REGULAR = str(FONT_DIR / "NotoNaskhArabic-Regular.ttf")
FONT_BOLD = str(FONT_DIR / "NotoNaskhArabic-Bold.ttf")
pdfmetrics.registerFont(TTFont("Arabic", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("Arabic-Bold", FONT_BOLD))

PRIMARY = HexColor("#1e3a5f")
ACCENT = HexColor("#2563eb")
GOLD = HexColor("#d4a017")
SUCCESS_GREEN = HexColor("#059669")
LIGHT_BG = HexColor("#f0f4f8")
LIGHT_GREEN = HexColor("#d1fae5")
LIGHT_GOLD = HexColor("#fef3c7")
DARK_BG = HexColor("#0f172a")
ROW_ALT = HexColor("#f8fafc")

styles = getSampleStyleSheet()

def _ar(text):
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)

def _fmt(val):
    if isinstance(val, Decimal):
        return f"{val:,.2f}"
    return f"{val:,.2f}" if isinstance(val, (int, float)) else str(val or "0.00")

def _date_str(d):
    if not d:
        return "________"
    return d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)

def _status_watermark(canvas, doc, status):
    if status in ("paid", "approved"):
        canvas.saveState()
        canvas.setFillColor(HexColor("#d1fae5"))
        canvas.setFont("Arabic-Bold", 64)
        canvas.translate(460, 300)
        canvas.rotate(45)
        canvas.drawString(0, 0, _ar("مدفوع") if status == "paid" else _ar("معتمد"))
        canvas.restoreState()

def _header_footer(canvas, doc, ipc, project_name):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(PRIMARY)
    canvas.setFont("Arabic", 7)
    canvas.drawString(30*mm, 15*mm, _ar(f"المستخلص رقم: {ipc.ipc_number}"))
    canvas.drawRightString(w - 30*mm, 15*mm, _ar(f"صفحة {doc.page}"))
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(30*mm, 18*mm, w - 30*mm, 18*mm)
    canvas.restoreState()

def build_ipc_pdf(ipc: IPCHeader, details: list[IPCDetail], project_name: str = "") -> BytesIO:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=20*mm, bottomMargin=25*mm,
        leftMargin=20*mm, rightMargin=20*mm,
    )
    pw = A4[0] - 40*mm
    elements = []

    header_data = [
        [Paragraph(_ar("شركة نجيده للمقاولات العامة والتوريدات"), ParagraphStyle("h", fontName="Arabic-Bold", fontSize=16, textColor=PRIMARY, alignment=TA_CENTER)),
         Paragraph(_ar("Engineering Management System"), ParagraphStyle("h2", fontName="Arabic", fontSize=8, textColor=grey, alignment=TA_CENTER))],
        [Paragraph(_ar("مستخلص وسيط - شهادة دفع"), ParagraphStyle("t", fontName="Arabic-Bold", fontSize=14, textColor=ACCENT, alignment=TA_CENTER)),
         Paragraph(f"Interim Payment Certificate", ParagraphStyle("t2", fontName="Arabic", fontSize=10, textColor=grey, alignment=TA_CENTER))],
    ]
    hdr = Table(header_data, colWidths=[pw*0.5, pw*0.5])
    hdr.setStyle(TableStyle([
        ("SPAN", (0, 0), (1, 0)),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))

    status_tag = Paragraph(
        _ar(f"الحالة: {ipc.status.upper()}"),
        ParagraphStyle("st", fontName="Arabic-Bold", fontSize=9, textColor=SUCCESS_GREEN if ipc.status == "paid" else (GOLD if ipc.status == "submitted" else grey), alignment=TA_CENTER)
    )
    elements += [hdr, Spacer(1, 2*mm), status_tag]
    elements += [HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=8)]
    elements += [Spacer(1, 4*mm)]

    info_ar_left = [
        [_ar("رقم المستخلص"), _ar(f": {ipc.ipc_number}"), _ar("الفترة"), _ar(f": {ipc.ipc_period}")],
        [_ar("تاريخ البداية"), _ar(f": {_date_str(ipc.start_date)}"), _ar("تاريخ النهاية"), _ar(f": {_date_str(ipc.end_date)}")],
        [_ar("المشروع"), _ar(f": {project_name}"), _ar("سقف العقد"), _ar(f": {_fmt(ipc.contract_ceiling)}")],
    ]
    info_tbl = Table(info_ar_left, colWidths=[pw*0.12, pw*0.30, pw*0.12, pw*0.40])
    info_tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Arabic"),
        ("FONTNAME", (0, 0), (0, -1), "Arabic-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Arabic-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (0, -1), ACCENT),
        ("TEXTCOLOR", (2, 0), (2, -1), ACCENT),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(info_tbl)
    elements.append(Spacer(1, 6*mm))

    line_title = Paragraph(_ar("بنود المستخلص"), ParagraphStyle("lt", fontName="Arabic-Bold", fontSize=11, textColor=ACCENT, spaceBefore=4, spaceAfter=6))
    elements.append(line_title)

    line_headers = [_ar("الكود"), _ar("الوصف"), _ar("الوحدة"), _ar("الكمية السابقة"), _ar("الحالية"), _ar("التراكمي"), _ar("القيمة")]
    cw = [pw*0.10, pw*0.24, pw*0.06, pw*0.12, pw*0.12, pw*0.12, pw*0.12]
    line_data = [line_headers]
    for d in details:
        line_data.append([
            d.boq_item_code or "",
            d.boq_item_description or "",
            d.boq_item_unit or "",
            _fmt(d.previous_quantity),
            _fmt(d.current_quantity),
            _fmt(d.cumulative_quantity),
            _fmt(d.amount),
        ])
    line_tbl = Table(line_data, colWidths=cw, repeatRows=1)
    line_tbl.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Arabic-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("FONTNAME", (0, 1), (-1, -1), "Arabic"),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, ROW_ALT]),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("ALIGN", (2, 0), (2, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#d0d0d0")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(line_tbl)
    elements.append(Spacer(1, 6*mm))

    fin_title = Paragraph(_ar("الملخص المالي"), ParagraphStyle("ft", fontName="Arabic-Bold", fontSize=11, textColor=ACCENT, spaceBefore=4, spaceAfter=6))
    elements.append(fin_title)

    fin_ar = [
        [_ar("قيمة الأعمال المنفذة"), _fmt(ipc.total_works), ""],
        [_ar("مواد بالموقع"), _fmt(ipc.materials_on_site), ""],
        [_ar("الإجمالي"), _fmt(ipc.gross_amount), ""],
    ]
    fin_ar.append(["─" * 40, "─" * 12, ""])
    fin_ar.append([_ar("الخصوم:"), "", ""])
    fin_ar.append([_ar(f"  استقطاع تأمين ({ipc.retention_percent}%)"), _fmt(ipc.retention_amount), ""])
    fin_ar.append([_ar("  استرداد دفعة مقدمة"), _fmt(ipc.advance_recovery), ""])
    fin_ar.append([_ar("  غرامات"), _fmt(ipc.fines), ""])
    fin_ar.append([_ar("  تأمين"), _fmt(ipc.insurance), ""])
    fin_ar.append([_ar("  خصوم أخرى"), _fmt(ipc.other_deductions), ""])
    fin_ar.append(["─" * 40, "─" * 12, ""])
    fin_ar.append([_ar("إجمالي الخصوم"), _fmt(ipc.total_deductions), ""])
    fin_ar.append([_ar("صافي المستخلص"), _fmt(ipc.net_amount), _ar("***")])
    fin_ar.append(["─" * 40, "─" * 12, ""])
    fin_ar.append([_ar("إجمالي المستخلصات السابقة"), _fmt(ipc.previous_total), ""])
    fin_ar.append([_ar("المستحق حالياً"), _fmt(ipc.current_due), ""])
    fin_ar.append([_ar("الإجمالي حتى تاريخه"), _fmt(ipc.total_to_date), _ar("***")])
    fin_ar.append([_ar("سقف العقد"), _fmt(ipc.contract_ceiling), ""])
    fin_ar.append([_ar("إجمالي ما تمت فوترته"), _fmt(ipc.total_billed), ""])
    fin_ar.append([_ar("المتبقي"), _fmt(ipc.contract_ceiling - ipc.total_billed), ""])

    ft = Table(fin_ar, colWidths=[pw*0.50, pw*0.20, pw*0.15])
    ft.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Arabic"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_GOLD),
        ("BACKGROUND", (0, 10), (-1, 10), LIGHT_BG),
        ("BACKGROUND", (0, 14), (-1, 15), LIGHT_GREEN),
        ("FONTNAME", (0, 10), (-1, 10), "Arabic-Bold"),
        ("FONTNAME", (0, 14), (-1, 15), "Arabic-Bold"),
        ("FONTNAME", (0, 17), (-1, 17), "Arabic-Bold"),
        ("TEXTCOLOR", (0, 14), (-1, 15), SUCCESS_GREEN),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(ft)
    elements.append(Spacer(1, 6*mm))

    ded_title = Paragraph(_ar("تفاصيل الخصوم"), ParagraphStyle("dt", fontName="Arabic-Bold", fontSize=11, textColor=ACCENT, spaceBefore=4, spaceAfter=6))
    elements.append(ded_title)
    ded_rows = [
        [_ar("نوع الخصم"), _ar("المبلغ"), _ar("أساس الحساب")],
        [_ar("استقطاع تأمين"), _fmt(ipc.retention_amount), _ar(f"{ipc.retention_percent}% من الإجمالي ({_fmt(ipc.gross_amount)})")],
        [_ar("استرداد دفعة مقدمة"), _fmt(ipc.advance_recovery), _ar("حسب جدول السداد بالعقد")],
        [_ar("غرامات"), _fmt(ipc.fines), _ar("حسب شرط الجزاء بالعقد")],
        [_ar("تأمين"), _fmt(ipc.insurance), _ar("حسب وثيقة التأمين")],
        [_ar("خصوم أخرى"), _fmt(ipc.other_deductions), _ar("حسب العقد / أوامر التغيير")],
        [_ar("إجمالي الخصوم"), _fmt(ipc.total_deductions), ""],
    ]
    dt = Table(ded_rows, colWidths=[pw*0.30, pw*0.20, pw*0.40], repeatRows=1)
    dt.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Arabic-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Arabic"),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#d0d0d0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, ROW_ALT]),
        ("FONTNAME", (0, -1), (-1, -1), "Arabic-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), LIGHT_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(KeepTogether(dt))
    elements.append(Spacer(1, 10*mm))

    sig_title = Paragraph(_ar("التوقيعات"), ParagraphStyle("st", fontName="Arabic-Bold", fontSize=11, textColor=ACCENT, spaceBefore=4, spaceAfter=6))
    elements.append(sig_title)
    sig_ar = [
        [_ar("المهندس"), _ar("المقاول"), _ar("الاستشاري"), _ar("المالك")],
        ["", "", "", ""],
        ["", "", "", ""],
        [_ar("التاريخ: ____/____/____"), _ar("التاريخ: ____/____/____"), _ar("التاريخ: ____/____/____"), _ar("التاريخ: ____/____/____")],
    ]
    st = Table(sig_ar, colWidths=[pw*0.25]*4)
    st.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Arabic-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Arabic"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 1), (-1, 1), 24),
        ("BOTTOMPADDING", (0, 3), (-1, 3), 14),
        ("LINEABOVE", (0, 1), (-1, 1), 0.8, grey),
        ("LINEABOVE", (0, 2), (-1, 2), 0.8, grey),
        ("LINEBELOW", (0, 1), (-1, 3), 0.8, grey),
        ("LINEBELOW", (0, 2), (-1, 2), 0.8, grey),
        ("LINEBELOW", (0, 3), (-1, 3), 0.8, grey),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, white]),
    ]))
    elements.append(st)
    elements.append(Spacer(1, 4*mm))

    try:
        qr_data = f"IPC:{ipc.id}:{ipc.ipc_number}:{_fmt(ipc.net_amount)}"
        qr_code = qr.QrCodeWidget(qr_data, barHeight=18*mm, barWidth=18*mm)
        qr_bounds = qr_code.getBounds()
        qr_width = qr_bounds[2] - qr_bounds[0]
        qr_height = qr_bounds[3] - qr_bounds[1]
        qr_drawing = Drawing(45, 45)
        qr_drawing.add(qr_code)
        qr_drawing.add(Rect(0, 0, 18*mm, 18*mm, fillColor=white, strokeColor=grey, strokeWidth=0.3))
        qr_data_tbl = [[
            Paragraph(_ar("رمز التحقق"), ParagraphStyle("qr", fontName="Arabic", fontSize=6, textColor=grey, alignment=TA_CENTER)),
            qr_drawing,
        ]]
        qr_tbl = Table(qr_data_tbl, colWidths=[pw*0.6, pw*0.15])
        qr_tbl.setStyle(TableStyle([
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elements.append(qr_tbl)
    except Exception:
        pass

    elements.append(Spacer(1, 6*mm))
    footer_note = Paragraph(
        _ar("هذا المستخلص صادر من Engineering Management System وهو مستند رسمي."),
        ParagraphStyle("fn", fontName="Arabic", fontSize=7, textColor=grey, alignment=TA_CENTER)
    )
    elements.append(footer_note)

    def watermark(canvas, doc):
        _header_footer(canvas, doc, ipc, project_name)
        _status_watermark(canvas, doc, ipc.status)

    doc.build(elements, onFirstPage=watermark, onLaterPages=watermark)
    buf.seek(0)
    return buf
