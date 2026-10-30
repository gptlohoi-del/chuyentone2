/*
 * Xuất kết quả chuyển tone ra PNG bằng Canvas API của trình duyệt.
 * Không cần Internet, thư viện CDN hay quyền truy cập máy chủ.
 */
(function () {
    'use strict';

    const WIDTH = 760;
    const PADDING = 36;
    const TEXT_COLOR = '#333333';
    const FONT_FAMILY = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

    function wrapPlainText(ctx, text, maxWidth) {
        const words = Array.from(String(text).split(/(\s+)/)).filter(Boolean);
        const lines = [''];
        for (const word of words) {
            const candidate = lines[lines.length - 1] + word;
            if (ctx.measureText(candidate).width <= maxWidth) {
                lines[lines.length - 1] = candidate;
            } else if (ctx.measureText(word).width <= maxWidth) {
                lines.push(word.trimStart());
            } else {
                // Ngắt cả chuỗi dài không có dấu cách để không mất chữ trên ảnh.
                for (const char of Array.from(word)) {
                    const last = lines.length - 1;
                    if (lines[last] && ctx.measureText(lines[last] + char).width > maxWidth) {
                        lines.push(char);
                    } else {
                        lines[last] += char;
                    }
                }
            }
        }
        return lines.map(line => line.trimEnd());
    }

    function layoutColoredNotes(ctx, outputElement, maxWidth) {
        const lines = [[]];
        let occupied = 0;

        function newLine() {
            lines.push([]);
            occupied = 0;
        }

        function addPiece(piece, color, isSpace) {
            if (!piece) return;
            if (isSpace && occupied === 0) return;
            const width = ctx.measureText(piece).width;
            if (occupied + width > maxWidth && occupied > 0) {
                newLine();
                if (isSpace) return;
            }
            if (width > maxWidth) {
                for (const char of Array.from(piece)) addPiece(char, color, false);
                return;
            }
            lines[lines.length - 1].push({ text: piece, color, width });
            occupied += width;
        }

        // HTML đầu ra chỉ gồm text và <span> tô màu theo quan hệ nốt.
        // Đọc textContent thay vì innerHTML để không thực thi nội dung người dùng.
        for (const node of outputElement.childNodes) {
            const content = node.textContent || '';
            const color = node.nodeType === 1
                ? window.getComputedStyle(node).color
                : TEXT_COLOR;
            const parts = content.split(/(\r\n|\r|\n|[ \t]+)/);
            for (const part of parts) {
                if (!part) continue;
                if (/^(\r\n|\r|\n)$/.test(part)) {
                    newLine();
                } else {
                    const spaces = /^[ \t]+$/.test(part);
                    addPiece(part.replace(/\t/g, '    '), color, spaces);
                }
            }
        }
        return lines;
    }

    function exportSongImageOffline(options) {
        const { title, source, target, filename, outputElement } = options;
        if (!outputElement || !outputElement.textContent.trim()) {
            throw new Error('Chưa có nội dung để xuất ảnh.');
        }

        const measuringCanvas = document.createElement('canvas');
        const measure = measuringCanvas.getContext('2d');
        if (!measure) throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');

        measure.font = `bold 30px ${FONT_FAMILY}`;
        const titleLines = wrapPlainText(measure, title, WIDTH - 2 * PADDING);
        measure.font = `bold 22px ${FONT_FAMILY}`;
        const noteLines = layoutColoredNotes(measure, outputElement, WIDTH - 2 * PADDING);
        const titleLineHeight = 39;
        const noteLineHeight = 40;
        const titleY = PADDING + 30;
        const metaY = titleY + (titleLines.length - 1) * titleLineHeight + 51;
        const noteY = metaY + 58;
        const logicalHeight = Math.ceil(noteY + noteLineHeight * (noteLines.length - 1) + 22 + PADDING);

        // Giới hạn kích thước để điện thoại không hết bộ nhớ khi xuất bản nhạc dài.
        const scale = Math.min(2, 12000 / logicalHeight, Math.sqrt(14000000 / (WIDTH * logicalHeight)));
        if (scale < 0.5) {
            throw new Error('Bản nhạc quá dài để xuất thành một ảnh. Hãy chia thành các phần nhỏ.');
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(WIDTH * scale);
        canvas.height = Math.ceil(logicalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Không thể tạo ảnh trên thiết bị này.');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, WIDTH, logicalHeight);
        ctx.textBaseline = 'alphabetic';

        ctx.font = `bold 30px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2c3e50';
        titleLines.forEach((line, i) => ctx.fillText(line, WIDTH / 2, titleY + i * titleLineHeight));

        ctx.font = `18px ${FONT_FAMILY}`;
        const sourceText = `Tone gốc: ${source || 'Chưa chọn'}   →   Tone đích: `;
        const targetText = String(target);
        const completeWidth = ctx.measureText(sourceText).width + ctx.measureText(targetText).width;
        const left = (WIDTH - completeWidth) / 2;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#7f8c8d';
        ctx.fillText(sourceText, left, metaY);
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(targetText, left + ctx.measureText(sourceText).width, metaY);

        ctx.font = `bold 22px ${FONT_FAMILY}`;
        noteLines.forEach((line, i) => {
            let x = PADDING;
            const y = noteY + i * noteLineHeight;
            line.forEach(segment => {
                ctx.fillStyle = segment.color;
                ctx.fillText(segment.text, x, y);
                x += segment.width;
            });
        });

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    window.exportSongImageOffline = exportSongImageOffline;
})();
