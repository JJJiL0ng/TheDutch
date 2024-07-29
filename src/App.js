import React, { useState } from 'react';
import './App.css';

const DutchPayCalculator = () => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [newRowValue, setNewRowValue] = useState('');
  const [newColumnMenu, setNewColumnMenu] = useState('');
  const [newColumnPrice, setNewColumnPrice] = useState('');
  const [prices, setPrices] = useState({});
  const [calculated, setCalculated] = useState(false);
  const [detailedResults, setDetailedResults] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalSum, setTotalSum] = useState(null);

  const addRow = () => {
    if (newRowValue.trim() !== '') {
      setRows([...rows, { name: newRowValue, checks: Array(headers.length).fill(false), total: 0 }]);
      setNewRowValue('');
    }
  };

  const addColumn = () => {
    if (newColumnMenu.trim() !== '' && newColumnPrice.trim() !== '') {
      const newHeader = newColumnMenu;
      setHeaders([...headers, newHeader]);
      setRows(rows.map(row => ({
        ...row,
        checks: [...row.checks, false]
      })));
      setPrices({...prices, [newHeader]: parseFloat(newColumnPrice) || 0});
      setNewColumnMenu('');
      setNewColumnPrice('');
    }
  };

  const toggleCheck = (rowIndex, colIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].checks[colIndex] = !newRows[rowIndex].checks[colIndex];
    setRows(newRows);
    setCalculated(false);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const calculateDutchPay = () => {
    const newRows = rows.map(row => ({ ...row, total: 0 }));
    const newDetailedResults = rows.map(row => ({ name: row.name, items: [] }));

    headers.forEach((header, colIndex) => {
      const price = prices[header] || 0;
      const checkedCount = rows.filter(row => row.checks[colIndex]).length;

      if (checkedCount > 0) {
        const pricePerPerson = price / checkedCount;
        rows.forEach((row, rowIndex) => {
          if (row.checks[colIndex]) {
            newRows[rowIndex].total += pricePerPerson;
            newDetailedResults[rowIndex].items.push({
              menu: header,
              price: pricePerPerson
            });
          }
        });
      }
    });

    setRows(newRows);
    setDetailedResults(newDetailedResults);
    setCalculated(true);

    // 새로운 라운드 저장
    const newRound = {
      roundNumber: currentRound,
      headers: [...headers],
      rows: newRows,
      prices: {...prices},
      detailedResults: newDetailedResults
    };
    setRounds([...rounds, newRound]);
    setTotalSum(null); // 새 라운드가 추가되면 총합 초기화
  };

  const deleteRow = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
    setCalculated(false);
  };

  const deleteColumn = (index) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);

    const newPrices = { ...prices };
    delete newPrices[headers[index]];
    setPrices(newPrices);

    const newRows = rows.map(row => {
      const newChecks = [...row.checks];
      newChecks.splice(index, 1);
      return { ...row, checks: newChecks };
    });
    setRows(newRows);
    setCalculated(false);
  };

  const startNewRound = () => {
    setHeaders([]);
    setRows(rows.map(row => ({ ...row, checks: [], total: 0 })));
    setPrices({});
    setCalculated(false);
    setDetailedResults([]);
    setCurrentRound(currentRound + 1);
  };

  const calculateTotalSum = () => {
    const totalSumByPerson = {};
    
    rounds.forEach(round => {
      round.rows.forEach(row => {
        if (totalSumByPerson[row.name]) {
          totalSumByPerson[row.name] += row.total;
        } else {
          totalSumByPerson[row.name] = row.total;
        }
      });
    });

    setTotalSum(totalSumByPerson);
  };

  return (
    <div className="container">
      <h2 className="title">The Dutch</h2>
      <p className="current-round">현재 차수: {currentRound}차</p>
      <input
        className="input"
        value={newRowValue}
        onChange={(e) => setNewRowValue(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, addRow)}
        placeholder="새 참여자 이름"
      />
      <button className="button" onClick={addRow}>참여자 추가</button>
      <input
        className="input"
        value={newColumnMenu}
        onChange={(e) => setNewColumnMenu(e.target.value)}
        placeholder="새 메뉴 이름"
      />
      <input
        className="input"
        value={newColumnPrice}
        onChange={(e) => setNewColumnPrice(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, addColumn)}
        placeholder="메뉴 가격"
      />
      <button className="button" onClick={addColumn}>메뉴 추가</button>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="header-cell">참여자/메뉴</th>
              {headers.map((header, index) => (
                <th key={index} className="header-cell">
                  <div className="header-content">
                    <span>{header}<br />{`(${prices[header]}원)`}</span>
                    <button className="delete-button menu-delete" onClick={() => deleteColumn(index)}>X</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="cell">
                  <div className="member-cell">
                    <span>{row.name}</span>
                    <button className="delete-button member-delete" onClick={() => deleteRow(rowIndex)}>X</button>
                  </div>
                </td>
                {row.checks.map((checked, colIndex) => (
                  <td key={colIndex} className="cell center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheck(rowIndex, colIndex)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && headers.length > 0 && (
        <div>
          <button className="button calculate-button" onClick={calculateDutchPay}>계산</button>
          <button className="button new-round-button" onClick={startNewRound}>다음 차수 시작</button>
        </div>
      )}
      {calculated && (
        <div className="result">
          <h3 className="result-title">{currentRound - 1}차 계산 결과:</h3>
          {detailedResults.map((result, index) => (
            <div key={index} className="member-result">
              <h4>{result.name}: {Math.round(rows[index].total)}원</h4>
              <ul>
                {result.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {item.menu}: {Math.round(item.price)}원
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="all-rounds-results">
        <h3>전체 차수 결과</h3>
        {rounds.map((round, index) => (
          <div key={index} className="round-result">
            <h4>{round.roundNumber}차 결과</h4>
            {round.rows.map((row, rowIndex) => (
              <p key={rowIndex}>{row.name}: {Math.round(row.total)}원</p>
            ))}
          </div>
        ))}
      </div>
      
      <button className="button total-sum-button" onClick={calculateTotalSum}>전체 차수 결과 총합 계산</button>
      
      {totalSum && (
        <div className="total-sum-result">
          <h3>전체 차수 결과 총합</h3>
          {Object.entries(totalSum).map(([name, total], index) => (
            <p key={index}>{name}: {Math.round(total)}원</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DutchPayCalculator;