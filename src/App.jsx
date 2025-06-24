import React, { useState, useEffect } from 'react';
import './styles.css';

const gradePoints = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

function App() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [credit, setCredit] = useState('');
  const [grade, setGrade] = useState('');
  const [gpa, setGpa] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingGrade, setEditingGrade] = useState('');
  const [invalidEditAlertShown, setInvalidEditAlertShown] = useState(false);

  const [regCredits, setRegCredits] = useState('');
  const [prevCgpa, setPrevCgpa] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');
  const [currentGpa, setCurrentGpa] = useState('');
  const [projectedCgpa, setProjectedCgpa] = useState(null);

  const [additionalInfos, setAdditionalInfos] = useState([]);

  const isValidGrade = g => g && gradePoints.hasOwnProperty(g.toUpperCase());

  const addSubject = () => {
    if (!subjectName.trim() || !credit || !isValidGrade(grade)) {
      alert('Valid subject, credit, and grade are required.');
      return;
    }
    setSubjects([...subjects, { subjectName: subjectName.trim(), credit: parseFloat(credit), grade: grade.toUpperCase() }]);
    setSubjectName('');
    setCredit('');
    setGrade('');
  };

  const deleteSubject = idx => setSubjects(subjects.filter((_, i) => i !== idx));

  useEffect(() => {
    let total = 0, sum = 0;
    subjects.forEach(s => {
      sum += gradePoints[s.grade] * s.credit;
      total += s.credit;
    });
    const newGpa = total ? (sum / total).toFixed(2) : null;
    setGpa(newGpa);
  }, [subjects]);

  const roundDownToHalf = v => Math.floor(v * 2) / 2;
  const roundUpTwoDecimals = n => Math.ceil(n * 100) / 100;

  useEffect(() => {
    const r = parseFloat(regCredits) || 0;
    const prev = parseFloat(prevCgpa) || 0;
    const cc = parseFloat(currentCredits) || 0;
    const cg = parseFloat(currentGpa) || 0;

    if (r + cc === 0) {
      setProjectedCgpa(null);
      return;
    }

    const weightedReg = roundDownToHalf(r * prev);
    const weightedCur = cc * cg;
    const additionalBonus = additionalInfos.reduce((acc, i) => {
      const prevGP = gradePoints[i.prevGrade.toUpperCase()] ?? 0;
      const newGP = gradePoints[i.newGrade.toUpperCase()] ?? 0;
      const diff = Math.max(newGP - prevGP, 0);
      return acc + diff * parseFloat(i.credit || 0);
    }, 0);

    const numerator = weightedReg + weightedCur + additionalBonus;
    const denominator = r + cc;
    const cgpa = roundUpTwoDecimals(numerator / denominator).toFixed(2);
    setProjectedCgpa(cgpa);
  }, [regCredits, prevCgpa, currentCredits, currentGpa, additionalInfos]);

  const startEditing = idx => {
    setEditingIndex(idx);
    setEditingGrade(subjects[idx].grade);
    setInvalidEditAlertShown(false);
  };

  const saveEditing = () => {
    if (!isValidGrade(editingGrade)) {
      if (!invalidEditAlertShown) {
        alert('Invalid grade. Enter a grade between S–F.');
        setInvalidEditAlertShown(true);
      }
      return;
    }
    const u = [...subjects];
    u[editingIndex].grade = editingGrade.toUpperCase();
    setSubjects(u);
    setEditingIndex(null);
    setEditingGrade('');
    setInvalidEditAlertShown(false);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingGrade('');
    setInvalidEditAlertShown(false);
  };

  const onEditKeyDown = e => {
    if (e.key === 'Enter') saveEditing();
    else if (e.key === 'Escape') cancelEditing();
  };

  const addAdditional = () => {
    setAdditionalInfos([
      ...additionalInfos,
      { credit: '', prevGrade: '', newGrade: '' }
    ]);
  };

  const updateAdditional = (i, field, value) => {
    const arr = [...additionalInfos];
    arr[i][field] = value;
    setAdditionalInfos(arr);
  };

  const deleteAdditional = i => {
    setAdditionalInfos(additionalInfos.filter((_, idx) => idx !== i));
  };

  return (
    <div className="container">
      <h1>VIT GPA & CGPA Calculator</h1>

      <div className="calculator-section">
        <h2>GPA Calculator</h2>
        <div className="form">
          <input placeholder="Subject Name" value={subjectName} onChange={e => setSubjectName(e.target.value)} />
          <input type="number" step="0.5" placeholder="Credit" value={credit} onChange={e => setCredit(e.target.value)} />
          <input placeholder="Grade" maxLength={1} value={grade} onChange={e => setGrade(e.target.value)} />
          <button onClick={addSubject} className="add-btn">Add</button>
        </div>
        <div className="subject-list">
          <h2>Subjects</h2>
          {subjects.length === 0 ? <p>No subjects added yet.</p> :
            <ul>{subjects.map((s, idx) =>
              <li key={idx} className="subject-item">
                <span className="subject-name">{s.subjectName}</span>
                <span className="subject-credit">{s.credit} credits</span>
                <span>Grade Obtained/expected: {
                  editingIndex === idx ?
                    <input className="edit-grade-input" value={editingGrade} onChange={e => setEditingGrade(e.target.value)} maxLength={1} onBlur={saveEditing} onKeyDown={onEditKeyDown} autoFocus /> :
                    <span className="grade-text">{s.grade}</span>
                }</span>
                {editingIndex !== idx && <>
                  <button className="edit-btn" onClick={() => startEditing(idx)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteSubject(idx)}>Delete</button>
                </>}
              </li>
            )}</ul>
          }
        </div>
        {gpa && <h3 className="gpa-result">Your GPA: {gpa}</h3>}
      </div>

      <div className="calculator-section">
        <h2>CGPA Calculator</h2>
        <div className="form">
          <div className="input-group">
            <input type="number" step="0.5" placeholder="Registered Credits" value={regCredits} onChange={e => setRegCredits(e.target.value)} />
            <input type="number" step="0.01" placeholder="CGPA Till Now" value={prevCgpa} onChange={e => setPrevCgpa(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="number" step="0.5" placeholder="Current Credits" value={currentCredits} onChange={e => setCurrentCredits(e.target.value)} />
            <input type="number" step="0.01" placeholder="GPA Obtained" value={currentGpa} onChange={e => setCurrentGpa(e.target.value)} />
          </div>
        </div>

        <div className="additional-section">
          <h3>Additional Information for GradeImprovement/Arrear CGPA Calculation</h3>
          {additionalInfos.map((info, i) =>
            <div key={i} className="additional-entry">
              <input type="number" step="0.5" placeholder="Credits" value={info.credit} onChange={e => updateAdditional(i, 'credit', e.target.value)} />
              <input placeholder="Prev Grade" maxLength={1} value={info.prevGrade} onChange={e => updateAdditional(i, 'prevGrade', e.target.value)} />
              <input placeholder="New Grade" maxLength={1} value={info.newGrade} onChange={e => updateAdditional(i, 'newGrade', e.target.value)} />
              <button className="delete-btn" onClick={() => deleteAdditional(i)}>Delete</button>
            </div>
          )}
          <button onClick={addAdditional} className="add-btn">+ Add Info</button>
        </div>

        {projectedCgpa !== null && <h3 className="gpa-result">CGPA: {projectedCgpa}</h3>}
      </div>

       <div className="note-section">
        <h2>📢 What's New in This Calculator?</h2>
        <ul>
          <li>
            <strong>Grade Improvement & Arrear Calculation:</strong> Now includes support for <em>grade improvement</em> and <em>arrear subject</em> calculations to compute a more accurate <strong>CGPA</strong>.
          </li>
          <li>
            <strong>Additional Information Clarification:</strong>
            <ul>
              <li>For <strong>re-registered subjects</strong>, enter <strong>previous grade as 'F'</strong>.</li>
              <li>For <strong>All N Grade Obtained</strong>, enter <strong> grade as 'F'</strong>.</li>
              <li>For <strong>grade improvement</strong>, enter the <strong>actual previous grade</strong>.</li>
            </ul>
          </li>
          <li>
            <strong>Understanding Credits:</strong>
            <ul>
              <li><strong>Registered Credits:</strong> Total credits registered(Only Graded) <em>till now</em> (including <strong>backlogs</strong>)</li>
              <li><strong>Current Credits & GPA Obtained:</strong> Indicates the <strong>current semester's GPA</strong>, excluding grade improvements and re-registered subjects. Use the <strong>GPA calculator</strong> above to calculate this specifically.</li>
            </ul>
          </li>
        </ul>

        <h3>✅ Designed for Accuracy</h3>
        <p>
          This tool is built to calculate both <strong>GPA</strong> and <strong> CGPA</strong> precisely, following VIT's academic structure. Use it for planning and tracking your academic progress effectively.
        </p>
        <h3>📬 Found a Mistake or Have Feedback?</h3>
        <p>
          If you notice any <em>discrepancies or errors</em>, please{' '}
         <a href="https://in.linkedin.com/in/chakradharmukkamalla" target="_blank">Reach Me Out</a> — your feedback helps make this tool better!
        </p>
      </div>
    </div>
  );
}

export default App;
