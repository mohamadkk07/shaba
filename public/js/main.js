
function createClip() {
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;

    fetch('/create-clip', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ start, end })
    })
    .then(res => res.json())
    .then(data => {
        const result = document.getElementById('linkResult');
        result.innerHTML = '<p>تم إنشاء الرابط: <a href="' + data.url + '" target="_blank">' + data.url + '</a></p>';
    });
}
