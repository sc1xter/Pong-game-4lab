function addRecord(name, score) {
    let records = JSON.parse(localStorage.getItem('pong_leaderboard') || '[]');
    records.push({
        name: name || 'Аноним',
        score: score,
        date: new Date().toISOString()
    });
    records.sort((a, b) => b.score - a.score);
    records = records.slice(0, 50);
    localStorage.setItem('pong_leaderboard', JSON.stringify(records));
}