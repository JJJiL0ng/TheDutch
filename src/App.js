import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
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

  useEffect(() => {
    document.title = "The Dutch - 더치페이 계산기";
  }, []);

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

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setNewColumnPrice(isNaN(value) ? '' : value.toString());
  };

  const adjustPrice = (amount) => {
    const currentPrice = parseInt(newColumnPrice) || 0;
    const newPrice = Math.max(0, currentPrice + amount);
    setNewColumnPrice(newPrice.toString());
  };

  const calculateAndStartNewRound = () => {
    if (rows.length === 0 || headers.length === 0) {
      alert('참여자와 메뉴를 먼저 추가해주세요.');
      return;
    }

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

    const newRound = {
      roundNumber: currentRound,
      headers: [...headers],
      rows: newRows,
      prices: {...prices},
      detailedResults: newDetailedResults
    };
    setRounds([...rounds, newRound]);

    setHeaders([]);
    setRows(rows.map(row => ({ ...row, checks: [], total: 0 })));
    setPrices({});
    setCalculated(false);
    setDetailedResults([]);
    setCurrentRound(currentRound + 1);
    setTotalSum(null);
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
    <>
      <Helmet>
        <title>The Dutch - 더치페이 계산기</title>
        <meta name="description" content="간편한 더치페이 계산기. 여러 차수의 계산을 지원하며, 총액 계산 기능도 제공합니다." />
        <meta name="keywords" content="더치페이, 계산기, 분할 계산, 공평한 계산, 식사 비용 분담" />
        <meta property="og:title" content="The Dutch - 더치페이 계산기" />
        <meta property="og:description" content="간편한 더치페이 계산기. 여러 차수의 계산을 지원하며, 총액 계산 기능도 제공합니다." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com/dutch-pay-calculator" />
        <link rel="canonical" href="https://your-domain.com/dutch-pay-calculator" />
      </Helmet>
      <main className="container">
        <header>
          <h1 className="title">The Dutch</h1>
          <p className="current-round">현재 차수: {currentRound}차</p>
        </header>
        <section className="input-section">
          <label htmlFor="newParticipant" className="visually-hidden">새 참여자 이름</label>
          <input
            id="newParticipant"
            className="input full-width"
            value={newRowValue}
            onChange={(e) => setNewRowValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addRow)}
            placeholder="새 참여자 이름"
            aria-label="새 참여자 이름"
          />
          <button className="button full-width" onClick={addRow}>참여자 추가</button>
          <div className="input-group">
            <label htmlFor="newMenu" className="visually-hidden">새 메뉴 이름</label>
            <input
              id="newMenu"
              className="input half-width"
              value={newColumnMenu}
              onChange={(e) => setNewColumnMenu(e.target.value)}
              placeholder="새 메뉴 이름"
              aria-label="새 메뉴 이름"
            />
            <div className="price-input-group">
              <label htmlFor="newPrice" className="visually-hidden">메뉴 가격</label>
              <input
                id="newPrice"
                className="input price-input"
                value={newColumnPrice}
                onChange={handlePriceChange}
                placeholder="메뉴 가격"
                type="number"
                min="0"
                step="1000"
                aria-label="메뉴 가격"
              />
              <div className="price-adjust-buttons">
                <button className="price-adjust-button" onClick={() => adjustPrice(1000)} aria-label="가격 1000원 증가">+</button>
                <button className="price-adjust-button" onClick={() => adjustPrice(-1000)} aria-label="가격 1000원 감소">-</button>
              </div>
            </div>
          </div>
          <button className="button full-width" onClick={addColumn}>메뉴 추가</button>
        </section>
        <section className="table-container">
          <table className="table">
            <caption className="visually-hidden">더치페이 계산 테이블</caption>
            <thead>
              <tr>
                <th scope="col" className="corner-header">
                  <span className="participant">참여자</span>
                  <span className="menu">메뉴</span>
                </th>
                {headers.map((header, index) => (
                  <th key={index} scope="col" className="header-cell">
                    <div className="header-content">
                      <span>{header}<br />{`(${prices[header]}원)`}</span>
                      <button className="delete-button" onClick={() => deleteColumn(index)} aria-label={`${header} 메뉴 삭제`}>×</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th scope="row" className="cell">
                    <div className="member-cell">
                      <span>{row.name}</span>
                      <button className="delete-button" onClick={() => deleteRow(rowIndex)} aria-label={`${row.name} 참여자 삭제`}>×</button>
                    </div>
                  </th>
                  {row.checks.map((checked, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`cell center ${checked ? 'checked' : ''}`}
                      onClick={() => toggleCheck(rowIndex, colIndex)}
                      role="checkbox"
                      aria-checked={checked}
                      tabIndex="0"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleCheck(rowIndex, colIndex);
                        }
                      }}
                    >
                      {checked ? '✓' : <span className="circle"></span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <button className="button full-width" onClick={calculateAndStartNewRound}>계산 및 다음 차수 시작</button>
        {calculated && (
          <section className="result">
            <h2 className="result-title">{currentRound - 1}차 계산 결과:</h2>
            {detailedResults.map((result, index) => (
              <article key={index} className="member-result">
                <h3>{result.name}: {Math.round(rows[index].total)}원</h3>
                <ul>
                  {result.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {item.menu}: {Math.round(item.price)}원
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )}
        <section className="all-rounds-results">
          <h2>전체 차수 결과</h2>
          {rounds.map((round, index) => (
            <article key={index} className="round-result">
              <h3>{round.roundNumber}차 결과</h3>
              {round.rows.map((row, rowIndex) => (
                <p key={rowIndex}>{row.name}: {Math.round(row.total)}원</p>
              ))}
            </article>
          ))}
        </section>
        
        <button className="button full-width" onClick={calculateTotalSum}>전체 차수 결과 총합 계산</button>
        
        {totalSum && (
          <section className="total-sum-result">
            <h2>전체 차수 결과 총합</h2>
            {Object.entries(totalSum).map(([name, total], index) => (
              <p key={index}>{name}: {Math.round(total)}원</p>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default DutchPayCalculator;