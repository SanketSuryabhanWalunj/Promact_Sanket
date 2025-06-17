using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.Core.Dto.Internship;
using NPOI.HSSF.Model;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace AITrainer.AITrainer.Util
{
    public static class ExcelHelper
    {
        public static byte[] CreateFile(List<BatchwiseInternshipInfo> source, string batchName)
        {
            XSSFWorkbook workbook = new XSSFWorkbook();
            foreach (var internship in source)
            {
                ISheet sheet = workbook.CreateSheet($"{internship.Name}");
                IRow rowHeader = sheet.CreateRow(0);

                // Adding Intern Name, Career Path, and Batch Name to the header
                int colIndex = 0;
                XSSFCell nameCell = (XSSFCell)rowHeader.CreateCell(colIndex++);
                nameCell.SetCellValue("Name");

                XSSFCell careerPathCell = (XSSFCell)rowHeader.CreateCell(colIndex++);
                careerPathCell.SetCellValue("Career Path");

                XSSFCell batchCell = (XSSFCell)rowHeader.CreateCell(colIndex++);
                batchCell.SetCellValue("Batch Name");

                System.Reflection.PropertyInfo[] properties = typeof(InternOverallFeedback).GetProperties();

                // Header for other properties
                IFont font = workbook.CreateFont();
                font.IsBold = true;
                ICellStyle style = workbook.CreateCellStyle();
                style.SetFont(font);

                foreach (System.Reflection.PropertyInfo property in properties)
                {
                    if (property.PropertyType == typeof(MessageFormat))
                    {
                        // Flatten MessageFormat properties
                        foreach (System.Reflection.PropertyInfo messageProperty in typeof(MessageFormat).GetProperties())
                        {
                            ICell cell = rowHeader.CreateCell(colIndex++);
                            cell.SetCellValue($"{property.Name}_{messageProperty.Name}");
                            cell.CellStyle = style;
                        }
                    }
                    else
                    {
                        ICell cell = rowHeader.CreateCell(colIndex++);
                        cell.SetCellValue(property.Name);
                        cell.CellStyle = style;
                    }
                }
                // End header

                // Content
                int rowNum = 1;
                foreach (InternOverallFeedback item in internship.FeedbackList)
                {
                    int colContentIndex = 0;
                    XSSFRow rowContent = (XSSFRow)sheet.CreateRow(rowNum++);

                    // Adding intern's name, career path, and batch name to content rows
                    XSSFCell nameContentCell = (XSSFCell)rowContent.CreateCell(colContentIndex++);
                    nameContentCell.SetCellValue(internship.Name);

                    XSSFCell careerPathContentCell = (XSSFCell)rowContent.CreateCell(colContentIndex++);
                    careerPathContentCell.SetCellValue(internship.CareerPath?.Name ?? "N/A");

                    XSSFCell batchNameContentCell = (XSSFCell)rowContent.CreateCell(colContentIndex++);
                    batchNameContentCell.SetCellValue(batchName);

                    foreach (System.Reflection.PropertyInfo property in properties)
                    {
                        object? value = property.GetValue(item, null);
                        if (property.PropertyType == typeof(MessageFormat))
                        {
                            // Flatten MessageFormat properties
                            foreach (System.Reflection.PropertyInfo messageProperty in typeof(MessageFormat).GetProperties())
                            {
                                ICell cellContent = rowContent.CreateCell(colContentIndex++);
                                object? messageValue = messageProperty.GetValue(value, null);
                                cellContent.SetCellValue(messageValue?.ToString() ?? "");
                            }
                        }
                        else
                        {
                            ICell cellContent = rowContent.CreateCell(colContentIndex++);

                            if (value == null)
                            {
                                cellContent.SetCellValue("");
                            }
                            else if (property.PropertyType == typeof(string))
                            {
                                cellContent.SetCellValue(value.ToString());
                            }
                            else if (property.PropertyType == typeof(int) || property.PropertyType == typeof(int?))
                            {
                                cellContent.SetCellValue(Convert.ToInt32(value));
                            }
                            else if (property.PropertyType == typeof(double) || property.PropertyType == typeof(double?))
                            {
                                cellContent.SetCellValue(Convert.ToDouble(value));
                            }
                            else if (property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(DateTime?))
                            {
                                DateTime dateValue = (DateTime)value;
                                cellContent.SetCellValue(dateValue.ToString("HH:mm:ss dd-MM-yyyy"));
                            }
                            else
                            {
                                cellContent.SetCellValue(value.ToString());
                            }
                        }
                    }
                }
                // End content
            }

            MemoryStream stream = new MemoryStream();
            workbook.Write(stream);
            byte[] content = stream.ToArray();

            return content;
        }

        /// <summary>
        /// Creates an Excel file containing scoreboard data based on the provided list of ScoreboardResponse objects.
        /// </summary>
        /// <param name="scoreboardData">List of ScoreboardResponse objects containing data to be included in the Excel file.</param>
        /// <returns>Byte array representing the Excel file.</returns>       
        public static byte[] CreateFile(List<ScoreboardResponse> scoreboardData)
        {
            scoreboardData = scoreboardData.OrderByDescending(data => data.Percentage ?? 0).ToList();
            var workbook = new XSSFWorkbook();
            var sheet = workbook.CreateSheet("Scoreboard");

            var headerFont = workbook.CreateFont();
            headerFont.IsBold = true;
            var headerStyle = workbook.CreateCellStyle();
            headerStyle.SetFont(headerFont);

            var header = sheet.CreateRow(0);
            var headers = new[] { "Rank", "Candidate Name", "Score", "Course" };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = header.CreateCell(i);
                cell.SetCellValue(headers[i]);
                cell.CellStyle = headerStyle;
            }

            var maxColumnWidths = new int[headers.Length];

            for (int i = 0; i < headers.Length; i++)
            {
                sheet.SetColumnWidth(i, 15 * 256);
            }

            var wrapStyle = workbook.CreateCellStyle();
            wrapStyle.WrapText = true;


            for (int i = 0; i < scoreboardData.Count; i++)
            {
                var dataRow = sheet.CreateRow(i + 1);
                dataRow.CreateCell(0).SetCellValue(i + 1);
                maxColumnWidths[0] = Math.Max(maxColumnWidths[0], (i + 1).ToString().Length);

                string fullName = scoreboardData[i].Firstname + " " + scoreboardData[i].Lastname;
                var nameCell = dataRow.CreateCell(1);
                nameCell.SetCellValue(fullName);
                nameCell.CellStyle = wrapStyle; 
                maxColumnWidths[1] = Math.Max(maxColumnWidths[1], fullName.Length);

                dataRow.CreateCell(2).SetCellValue(scoreboardData[i].Percentage.HasValue ? scoreboardData[i].Percentage.Value : 0.0);
                maxColumnWidths[2] = Math.Max(maxColumnWidths[2], scoreboardData[i].Percentage.HasValue ? scoreboardData[i].Percentage.Value.ToString().Length : 4);

                string courses = string.Join(", ", scoreboardData[i].Course);
                var courseCell = dataRow.CreateCell(3);
                courseCell.SetCellValue(courses);
                courseCell.CellStyle = wrapStyle; 
                maxColumnWidths[3] = Math.Max(maxColumnWidths[3], courses.Length);
            }

            for (int i = 0; i < headers.Length; i++)
            {
                int columnWidth = (maxColumnWidths[i] + 2) * 256;
                if (columnWidth > 62720)
                {
                    sheet.SetColumnWidth(i, 62720);
                }
                else
                {
                    sheet.SetColumnWidth(i, columnWidth);
                }
            }

            using (var memoryStream = new MemoryStream())
            {
                workbook.Write(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}
