 function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardContent');
    let records = JSON.parse(localStorage.getItem('pong_leaderboard') || '[]');
    records.sort((a, b) => b.score - a.score);

    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-msg">
                🎮 Пока нет рекордов<br>
                <span style="font-size:14px;color:var(--text-dark);">Сыграйте первую игру!</span>
            </div>
        `;
        return;
    }

    const top = records.slice(0, 10);
    let html = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Игрок</th>
                    <th>Счёт</th>
                    <th>Дата</th>
                </tr>
            </thead>
            <tbody>
    `;

    top.forEach((record, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const date = record.date ? new Date(record.date).toLocaleDateString() : '—';
        html += `
            <tr>
                <td class="rank">${medal}</td>
                <td>${escapeHtml(record.name || 'Аноним')}</td>
                <td class="score-val">${record.score}</td>
                <td style="color:var(--text-dim);font-size:14px;">${date}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div style="text-align:center;margin-top:15px;font-size:13px;color:var(--text-dark);">
            Всего рекордов: ${records.length}
        </div>
    `;

    container.innerHTML = html;
}

function clearLeaderboard() {
    const confirmed = confirm('🗑 Вы уверены, что хотите очистить таблицу лидеров?\n\nЭто действие нельзя отменить!');
    if (confirmed) {
        localStorage.removeItem('pong_leaderboard');
        renderLeaderboard();
        alert('✅ Таблица лидеров очищена!');
    }
}

renderLeaderboard();
