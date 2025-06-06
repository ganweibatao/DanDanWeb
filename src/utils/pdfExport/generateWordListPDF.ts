import { jsPDF } from 'jspdf';
// 直接导入jspdf-autotable并应用到jsPDF
import autoTable from 'jspdf-autotable';

// 重新定义单词类型，完全兼容DisplayVocabularyWord
export interface Word {
  id?: number;
  word: string;
  translation?: string | null;
  word_basic_id?: number;
  book_id?: number | null;
  [key: string]: any; // 允许任何其他属性
}

// 为jspdf扩展类型定义，以支持autoTable方法
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// 导出类型
export type ExportType = '中英' | '仅中文' | '仅英文';

/**
 * 生成单词列表PDF
 * @param words 单词列表
 * @param exportType 导出类型
 * @param isNewWords 是否为新学单词
 */
export const generateWordListPDF = (
  words: Word[],
  exportType: ExportType = '中英',
  isNewWords: boolean = true
) => {
  try {
    // 创建PDF实例 (A4尺寸)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 设置页面信息
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 页面边距
    
    // 添加Logo (假设Logo已存在于特定路径)
    // const logoPath = '/static/img/logo.png';
    // pdf.addImage(logoPath, 'PNG', margin, margin, 40, 15);
    
    // 添加标题 - 使用默认字体
    pdf.setFontSize(18);
    const title = isNewWords ? 'New Words Today' : 'Review Words Today';
    const titleY = margin + 2; // 标题Y坐标 (原为margin + 10)
    pdf.text(title, pageWidth / 2, titleY, { align: 'center' });
    
    // 添加学生、老师和日期在同一行，并为学生和老师添加下划线
    pdf.setFontSize(10);
    const studentLabel = "Student: "; 
    const teacherLabel = "Teacher: "; 
    const today = new Date();
    const dateText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const infoLineY = titleY + 7; // 信息行Y坐标，在标题下方7mm (原为margin + 10 + 7)
    const underlineLength = 40; // 下划线长度 (mm)
    const textHeight = pdf.getTextDimensions('M').h; // 获取大致文字高度用于下划线定位

    // 学生信息 (靠左)
    pdf.text(studentLabel, margin, infoLineY);
    const studentLabelWidth = pdf.getTextWidth(studentLabel);
    pdf.line(margin + studentLabelWidth, infoLineY + textHeight * 0.1, margin + studentLabelWidth + underlineLength, infoLineY + textHeight * 0.1);

    // 老师信息 (居中)
    const teacherLabelWidth = pdf.getTextWidth(teacherLabel);
    const totalTeacherElementWidth = teacherLabelWidth + underlineLength;
    const teacherStartX = (pageWidth / 2) - (totalTeacherElementWidth / 2);
    pdf.text(teacherLabel, teacherStartX, infoLineY);
    pdf.line(teacherStartX + teacherLabelWidth, infoLineY + textHeight * 0.1, teacherStartX + teacherLabelWidth + underlineLength, infoLineY + textHeight * 0.1);

    // 日期信息 (靠右)
    pdf.text(dateText, pageWidth - margin, infoLineY, { align: 'right' });
    
    // 处理单词数据 - 重新排列为左右两列布局
    const totalWords = words.length;
    const halfLength = Math.ceil(totalWords / 2);
    const processedData = [];
    
    for (let i = 0; i < halfLength; i++) {
      const leftWord = words[i];
      const rightWord = i + halfLength < totalWords ? words[i + halfLength] : null;
      
      // 左侧单词
      const leftRow = [
        i + 1,                      // 序号
        leftWord.word,              // 英文单词
        exportType === '仅英文' ? '' : (leftWord.translation || '') // 仅英文时不显示中文释义
      ];
      
      // 右侧单词 (如果存在)
      const rightRow = rightWord ? [
        i + halfLength + 1,             // 序号
        rightWord.word,                 // 英文单词
        exportType === '仅英文' ? '' : (rightWord.translation || '') // 仅英文时不显示中文释义
      ] : ['', '', ''];
      
      // 合并为一行，确保只添加六列
      processedData.push([...leftRow, ...rightRow].slice(0, 6)); // 只取前六列
    }

    // 定义表头
    const headers = ['No.', 'Word', 'Meaning', 'No.', 'Word', 'Meaning'];
    
    // 计算每列宽度 - 根据图中比例
    const colWidths = [
      15,  // 左侧编号列
      30,  // 左侧单词列
      45,  // 左侧释义列 (原为50)
      15,  // 右侧编号列
      30,  // 右侧单词列
      45   // 右侧释义列 (原为50)
    ];
    
    // 表格样式
    autoTable(pdf, {
      startY: infoLineY + 7, 
      head: [headers],
      body: processedData,
      theme: 'grid',
      headStyles: {
        fillColor: [46, 184, 138], // 绿色表头 #2eb88a
        textColor: 255,           // 白色文字
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 10,
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: colWidths[0], halign: 'center' }, // 左侧编号
        1: { cellWidth: colWidths[1] },                   // 左侧单词
        2: { cellWidth: colWidths[2] },                   // 左侧释义
        3: { cellWidth: colWidths[3], halign: 'center' }, // 右侧编号
        4: { cellWidth: colWidths[4] },                   // 右侧单词
        5: { cellWidth: colWidths[5] }                    // 右侧释义
      },
      margin: { top: margin, right: margin, bottom: margin + 5, left: margin },
      pageBreak: 'auto',
      rowPageBreak: 'auto',
      didDrawPage: function(data: any) {
        // 添加页码
        const pageCount = (pdf.internal as any).getNumberOfPages();
        pdf.setFontSize(10);
        pdf.text(`Page-${(pdf.internal as any).getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      },
      // 设置表格和单元格样式
      tableLineColor: [200, 200, 200],      // 浅灰色表格线
      tableLineWidth: 0.1,                  // 表格线宽度
      styles: {                            
        overflow: 'linebreak',              // 处理溢出文本
        cellWidth: 'auto',
        minCellHeight: 9                    // 增加最小单元格高度 (原为8)
      },
      // 设置交替行颜色
      alternateRowStyles: {
        fillColor: [255, 255, 255]          // 白色背景
      },
      // 设置首列的编号列样式为蓝色背景
      willDrawCell: function(data: any) {
        if (data.section === 'body') {
          // 设置左侧和右侧编号列的背景色
          if (data.column.index === 0 || data.column.index === 3) {
            data.cell.styles.fillColor = [240, 240, 240]; // 浅灰背景
          }
        }
      }
    });
    
    // 保存PDF
    const filename = `${isNewWords ? 'NewWords' : 'ReviewWords'}_Vocabulary.pdf`;
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('PDF生成错误:', error);
    throw error;
  }
}; 