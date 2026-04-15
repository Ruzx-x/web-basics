const form = document.getElementById('gradeForm');
    const tableBody = document.querySelector('#gradesTable tbody');
    const summary = document.getElementById('summary');

    let grades = [];

    function updateTable() {
        tableBody.innerHTML = '';
        let totalWeighted = 0;
        let totalWeight = 0;

        grades.forEach((g, index) => {
            const weightedFinal = ((g.predictedGrade || g.currentGrade) * g.weight) / 100;
            totalWeighted += weightedFinal;
            totalWeight += g.weight;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${g.subject}</td>
                <td>${g.currentGrade}%</td>
                <td>${g.weight}%</td>
                <td>${g.predictedGrade !== null ? g.predictedGrade + '%' : '-'}</td>
                <td>${weightedFinal.toFixed(2)}%</td>
                <td><button onclick="removeGrade(${index})">❌</button></td>
            `;
            tableBody.appendChild(row);
        });

        const overall = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
        summary.textContent = `Overall Weighted Average: ${overall.toFixed(2)}%`;
    }

    function removeGrade(index) {
        grades.splice(index, 1);
        updateTable();
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const subject = document.getElementById('subject').value.trim();
        const currentGrade = parseFloat(document.getElementById('currentGrade').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const predictedGradeInput = document.getElementById('predictedGrade').value;
        const predictedGrade = predictedGradeInput ? parseFloat(predictedGradeInput) : null;

        if (!subject || isNaN(currentGrade) || isNaN(weight) || currentGrade < 0 || currentGrade > 100 || weight <= 0 || weight > 100) {
            alert('Please enter valid values.');
            return;
        }

        grades.push({ subject, currentGrade, weight, predictedGrade });
        form.reset();
        updateTable();
    });