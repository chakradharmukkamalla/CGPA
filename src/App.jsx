import React, { useState, useEffect } from 'react';
import './styles.css';

const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
};

function App() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [credit, setCredit] = useState('');
  const [grade, setGrade] = useState('');
  const [gpa, setGpa] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingGrade, setEditingGrade] = useState('');

  // Added state to track if alert was shown during editing
  const [invalidEditAlertShown, setInvalidEditAlertShown] = useState(false);

  // Projected CGPA Inputs (optional)
  const [regCredits, setRegCredits] = useState('');
  const [prevCgpa, setPrevCgpa] = useState('');
  const [clearedCredits, setClearedCredits] = useState('');
  const [clearedGpa, setClearedGpa] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');
  const [currentGpa, setCurrentGpa] = useState('');
  const [projectedCgpa, setProjectedCgpa] = useState(null);

  const isValidGrade = (g) => g && gradePoints.hasOwnProperty(g.toUpperCase());

  const addSubject = () => {
    if (!subjectName.trim() || !credit || !isValidGrade(grade)) {
      alert('Please enter valid subject name, credit, and grade (S, A, B, C, D, E, F)');
      return;
    }

    const newSubject = {
      subjectName: subjectName.trim(),
      credit: parseFloat(credit),
      grade: grade.toUpperCase(),
    };

    setSubjects([...subjects, newSubject]);
    setSubjectName('');
    setCredit('');
    setGrade('');
  };

  const deleteSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  useEffect(() => {
    let totalCredits = 0;
    let weightedSum = 0;

    subjects.forEach((sub) => {
      const gp = gradePoints[sub.grade];
      weightedSum += gp * sub.credit;
      totalCredits += sub.credit;
    });

    const newGpa = totalCredits ? weightedSum / totalCredits : null;
    setGpa(newGpa ? newGpa.toFixed(2) : null);
  }, [subjects]);

  // Round down to nearest 0.5 multiple
  const roundDownToHalf = (value) => Math.floor(value * 2) / 2;

  // Round up to 2 decimals (ceil)
  const roundUpTwoDecimals = (num) => {
    return Math.ceil(num * 100) / 100;
  };

  // Automatic projected CGPA calculation based on inputs
  useEffect(() => {
    const r = parseFloat(regCredits) || 0;
    const rawCgpa = parseFloat(prevCgpa) || 0;
    const pc = parseFloat(clearedCredits) || 0;
    const pg = parseFloat(clearedGpa) || 0;
    const cc = parseFloat(currentCredits) || 0;
    const cg = parseFloat(currentGpa) || 0;

    if (r + cc === 0) {
      setProjectedCgpa(null);
      return;
    }

    // Registered CGPA * registered credits, rounded down to nearest 0.5
    const weightedRegistered = roundDownToHalf(r * rawCgpa);

    // Pending cleared credits * pending GPA, included only in numerator
    const weightedCleared = pc * pg;

    // Current semester credits * current GPA
    const weightedCurrent = cc * cg;

    // Final weighted sum numerator
    const numerator = weightedRegistered + weightedCleared + weightedCurrent;

    // Denominator excludes pending cleared credits
    const denominator = r + cc;

    const finalCgpaRaw = numerator / denominator;

    // Final projected CGPA rounded UP to 2 decimals
    const finalCgpaRoundedUp = roundUpTwoDecimals(finalCgpaRaw);

    setProjectedCgpa(finalCgpaRoundedUp.toFixed(2));
  }, [regCredits, prevCgpa, clearedCredits, clearedGpa, currentCredits, currentGpa]);

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingGrade(subjects[index].grade);
    setInvalidEditAlertShown(false); // reset alert shown flag when editing starts
  };

  const saveEditing = () => {
    if (!isValidGrade(editingGrade)) {
      if (!invalidEditAlertShown) {
        alert('Invalid grade. Use S, A, B, C, D, E, F.');
        setInvalidEditAlertShown(true);
      }
      return;
    }

    const updated = [...subjects];
    updated[editingIndex].grade = editingGrade.toUpperCase();
    setSubjects(updated);
    setEditingIndex(null);
    setEditingGrade('');
    setInvalidEditAlertShown(false);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingGrade('');
    setInvalidEditAlertShown(false);
  };

  const onEditKeyDown = (e) => {
    if (e.key === 'Enter') saveEditing();
    else if (e.key === 'Escape') cancelEditing();
  };

  return (
    <div className="container">
      <h1>VIT GPA & Projected CGPA Calculator</h1>

      {/* GPA Calculator */}
      <div className="calculator-section">
        <h2>GPA Calculator</h2>
        <div className="form">
          <input
            type="text"
            placeholder="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Credit"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            step="0.5"
          />
          <input
            type="text"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            maxLength={1}
          />
          <button onClick={addSubject} className="add-btn">Add</button>
        </div>

        <div className="subject-list">
          <h2>Subjects</h2>
          {subjects.length === 0 ? (
            <p className="no-subjects">No subjects added yet.</p>
          ) : (
            <ul>
              {subjects.map((sub, idx) => (
                <li key={idx} className="subject-item">
                  <span className="subject-name">{sub.subjectName}</span>
                  <span className="subject-credit">{sub.credit} credits</span>
                  <span>
                    Grade:{' '}
                    {editingIndex === idx ? (
                      <input
                        type="text"
                        value={editingGrade}
                        onChange={(e) => setEditingGrade(e.target.value)}
                        maxLength={1}
                        onBlur={saveEditing}
                        onKeyDown={onEditKeyDown}
                        autoFocus
                        className="edit-grade-input"
                      />
                    ) : (
                      <span className="grade-text">{sub.grade}</span>
                    )}
                  </span>
                  {editingIndex !== idx && (
                    <>
                      <button className="edit-btn" onClick={() => startEditing(idx)}>Edit</button>
                      <button className="delete-btn" onClick={() => deleteSubject(idx)}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {gpa && <h3 className="gpa-result">Your GPA: {gpa}</h3>}
      </div>

      {/* Projected CGPA Calculator */}
      <div className="calculator-section">
        <h2>Projected CGPA Calculator</h2>
        <div className="form">
          <div className="input-group">
            <input
              type="number"
              placeholder="Registered Credits"
              value={regCredits}
              onChange={(e) => setRegCredits(e.target.value)}
              step="0.5"
            />
            <input
              type="number"
              placeholder="CGPA"
              value={prevCgpa}
              onChange={(e) => setPrevCgpa(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              placeholder="Backlog Cleared Credits"
              value={clearedCredits}
              onChange={(e) => setClearedCredits(e.target.value)}
              step="0.5"
            />
            <input
              type="number"
              placeholder="Cleared Subjects GPA"
              value={clearedGpa}
              onChange={(e) => setClearedGpa(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              placeholder="Current Semester Credits"
              value={currentCredits}
              onChange={(e) => setCurrentCredits(e.target.value)}
              step="0.5"
            />
            <input
              type="number"
              placeholder="Current Semester GPA"
              value={currentGpa}
              onChange={(e) => setCurrentGpa(e.target.value)}
              step="0.01"
            />
          </div>
        </div>

        {projectedCgpa !== null && (
          <h3 className="gpa-result">Projected CGPA: {projectedCgpa}</h3>
        )}
      </div>
    </div>
  );
}

export default App;
