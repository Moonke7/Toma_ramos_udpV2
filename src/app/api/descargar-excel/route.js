// app/api/descargar-excel/route.js
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req) {
  const { horario, colorCatedra, colorAyudantia, colorLab } = await req.json();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Horario");

  // Encabezado
  const dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  worksheet.addRow(dias);

  const bloques = {
    A: "08:30 - 09:50",
    B: "10:00 - 11:20",
    C: "11:30 - 12:50",
    D: "13:00 - 14:20",
    E: "14:30 - 15:50",
    F: "16:00 - 17:20",
    G: "17:25 - 18:45",
    H: "18:50 - 20:10",
    I: "20:15 - 21:35",
  };

  const diasAbrev = ["LU", "MA", "MI", "JU", "VI"];

  let filaIndex = 2; // porque fila 1 ya es encabezado

  for (const [bloqueKey, hora] of Object.entries(bloques)) {
    const fila = [hora];

    diasAbrev.forEach((dia) => {
      const cellData = horario[dia]?.[bloqueKey];

      if (cellData) {
        const tipoClase =
          cellData.horarios.find(
            (h) => h[0] === dia && h[1] === bloqueKey
          )?.[2] || "";

        const texto = `${cellData.nombre}\n${tipoClase}\n${cellData.profesor} \n${cellData.seccion}`;
        fila.push(texto);
      } else {
        fila.push("");
      }
    });

    // Agregar fila
    worksheet.addRow(fila);

    // Aplicar colores
    diasAbrev.forEach((dia, diaIndex) => {
      const cellData = horario[dia]?.[bloqueKey];
      const colIndex = diaIndex + 2; // columna real en Excel (1-based)

      const excelCell = worksheet.getCell(filaIndex, colIndex);

      // Color de fondo base (todas las celdas del horario)
      excelCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "f2f7fc" },
      };

      if (!cellData) return;

      const tipoClase =
        cellData.horarios.find(
          (h) => h[0] === dia && h[1] === bloqueKey
        )?.[2] || "";

      let color = null;
      if (tipoClase.includes("AYUDANTÍA")) color = colorAyudantia;
      else if (tipoClase.includes("CÁTEDRA")) color = colorCatedra;
      else if (tipoClase.includes("LABORATORIO")) color = colorLab;

      if (color) {
        // Se sobrepone al color de fondo general si hay tipo de clase
        excelCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color.replace("#", "") },
        };
      }
    });

    // Color de fondo base también para la primera columna (hora)
    const horaCell = worksheet.getCell(filaIndex, 1);
    horaCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f2f7fc" },
    };

    filaIndex++;
  }

  // Estilizar encabezados (primera fila y primera columna)
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "333333" },
    };
    cell.font = {
      color: { argb: "FFFFFF" },
      bold: true,
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    row.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Fila de encabezado: color de fondo negro y texto blanco
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4f4f4f" }, // Negro
        };
        cell.font = {
          color: { argb: "FFFFFF" }, // Blanco
          bold: true,
        };
      });
    }

    // Estimar altura en base a número de líneas más largas
    let maxLines = 1;
    row.eachCell((cell) => {
      const lines = String(cell.value).split("\n").length;
      if (lines > maxLines) maxLines = lines;
    });

    console.log("Max lines:", maxLines);
    if (maxLines === 1) {
      row.height = 40; // Aproximadamente 40px por línea
    } else {
      row.height = maxLines * 25; // Aproximadamente 25px por línea
    }
  });

  // agregar bordes
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Estilos simples
  worksheet.columns.forEach((col) => {
    col.width = 28;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=horario.xlsx",
    },
  });
}
