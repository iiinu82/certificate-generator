import { useEffect, useRef, useState } from "react";

import "./App.css";

function App() {
  const [currentField, setCurrentField] = useState("name");
  const [input, setInput] = useState("");
  const [list, setList] = useState(() => {
    const savedList = localStorage.getItem("certificate_list");
    return savedList ? JSON.parse(savedList) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // 編集中のデータ
  const [deletingItem, setDeletingItem] = useState(null); // 削除しようとしているデータ
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    group: "",
    number: "",
    result: "",
  });

  useEffect(() => {
    localStorage.setItem("certificate_list", JSON.stringify(list));
  }, [list]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 空入力は登録しない
    if (input.trim() === "") {
      return;
    }

    let value = input;

    // 所属
    if (currentField === "group") {
      const groups = {
        1: "営業部",
        2: "総務部",
        3: "経理部",
        4: "企画部",
        5: "技術部",
      };

      value = groups[input] || input;
    }
    // 番号
    if (currentField === "number") {
      // 💡 正規表現を使って「半角数字でちょうど4桁か？」をチェックする
      const isValidNumber = /^\d{4}$/.test(input);

      if (!isValidNumber) {
        alert("番号は4桁の数字で入力してください！");
        return; // 4桁でなければここで処理を止めて先に進ませない
      }
    }
    // 合否
    if (currentField === "result") {
      if (input.toLowerCase() === "y") {
        value = "合格";
      } else if (input.toLowerCase() === "n") {
        value = "不合格";
      } else {
        // y,n以外なら登録しない
        return;
      }
    }

    // データを保存
    const updatedData = {
      ...formData,
      [currentField]: value,
    };
    setFormData(updatedData);

    // 次の項目へ
    if (currentField === "name") {
      setCurrentField("group");
      setInput("");
    } else if (currentField === "group") {
      setCurrentField("number");
      setInput("");
    } else if (currentField === "number") {
      setCurrentField("result");
      setInput("");
    } else if (currentField === "result") {
      // 💡 合否まで入力し終わったらモーダルを開く
      setIsModalOpen(true);
      setInput("");
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const reiwaYear = y >= 2019 ? y - 2018 : y;
    return `令和${reiwaYear}年${m}月${d}日`;
  };

  // 登録
  const handleRegister = () => {
    const newItem = {
      ...formData,
      id: crypto.randomUUID(), // ID
      date: getFormattedDate(), // 令和◯年◯月◯日
    };
    setList((prev) => [...prev, newItem]);

    setFormData({ name: "", group: "", number: "", result: "" });
    setCurrentField("name");
    setIsModalOpen(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // 登録のバリデーションチェック
  const isFormValid =
    formData.name &&
    formData.name.trim() !== "" &&
    formData.group &&
    formData.group.trim() !== "" &&
    formData.number &&
    formData.number.trim() !== "" &&
    formData.result &&
    formData.result.trim() !== "";
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // ✏️ 編集開始
  const handleOpenEditModal = (item) => {
    setEditingItem({ ...item }); // 編集用の一時データにコピー
    setIsEditModalOpen(true);
  };

  // 💾 編集内容を保存（更新）
  const handleUpdate = () => {
    setList((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item)),
    );
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // 🗑️ 削除確認モーダルを開く
  const handleOpenDeleteModal = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  // 🗑️ 削除実行
  const handleDelete = () => {
    setList((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  // PDFのモーダル関連 certificate＝証明書
  const [certificateItem, setCertificateItem] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const handleOpenCertificate = (item) => {
    setCertificateItem(item);
    setIsCertModalOpen(true);
  };

  // 印刷を実行する関数
  const handlePrint = () => {
    window.print();
  };

  // 現在の項目名
  const fieldLabels = {
    name: "名前",
    group: "所属",
    number: "番号",
    result: "合否",
  };

  return (
    <>
      <div className="flex">
        <div className="formArea">
          <h1>入力フォーム</h1>
          <form onSubmit={handleSubmit}>
            <label>
              <span className="bold">"{fieldLabels[currentField]}"</span>
              を入力して下さい。
            </label>
            <input
              className="mainForm"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              ref={inputRef}
            />{" "}
          </form>

          <div className="inputDataArea">
            <h3>登録データ確認・編集エリア</h3>
            <p>名前：</p>
            <input
              type="text"
              id="name"
              value={formData.name}
              placeholder="名前"
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
            ></input>
            <p>所属：{formData.group}</p>
            <select
              id="result"
              value={formData.group}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  group: e.target.value,
                }));
              }}
            >
              <option value="" disabled>
                選択してください
              </option>

              <option value="営業部">営業部</option>
              <option value="総務部">総務部</option>
              <option value="経理部">経理部</option>
              <option value="企画部">企画部</option>
              <option value="技術部">技術部</option>
            </select>
            <p>番号：</p>
            <input
              type="text"
              id="number"
              value={formData.number}
              placeholder="0000"
              maxLength={4}
              onChange={(e) => {
                const val = e.target.value;
                // 数字以外が入らないようにしつつ、4文字以内に制限する
                if (/^\d{0,4}$/.test(val)) {
                  setFormData((prev) => ({ ...prev, number: val }));
                }
              }}
            ></input>
            <p>合否：</p>
            <select
              id="result"
              value={formData.result}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  result: e.target.value,
                }));
              }}
            >
              <option value="" disabled>
                選択してください
              </option>

              <option value="合格">合格</option>
              <option value="不合格">不合格</option>
            </select>

            <div className="registerButton">
              <button onClick={() => setIsModalOpen(true)}>
                確認画面へ / 登録
              </button>
            </div>
          </div>
        </div>

        <div className="memoArea">
          <h3>所属ショートカット</h3>
          <p> 1: "営業部"</p>
          <p>2: "総務部"</p>
          <p>3: "経理部"</p>
          <p>4: "企画部"</p>
          <p>5: "技術部"</p>
          <h3>合否ショートカット</h3>
          <p>y: "合格"</p>
          <p>n: "不合格"</p>
        </div>

        {/* 登録リスト */}
        <div className="listArea">
          <h2>登録リスト ({list.length}件)</h2>

          <div className="listHeader">
            <div>名前</div>
            <div>所属</div>
            <div>番号</div>
            <div>結果</div>
            <div>操作</div>
          </div>

          <ul className="registrationList">
            {list.map((item) => (
              <li key={item.id} className="registrationItem">
                <div>{item.name}</div>
                <div>{item.group}</div>
                <div>{item.number}</div>
                <div>{item.result}</div>

                <div className="itemButtons">
                  <button
                    className="submitButton"
                    onClick={() => handleOpenEditModal(item)}
                  >
                    編集
                  </button>

                  <button
                    className="deleteButton"
                    onClick={() => handleOpenDeleteModal(item)}
                  >
                    削除
                  </button>
                  <button
                    onClick={() => handleOpenCertificate(item)}
                    disabled={item.result === "不合格"}
                    style={{
                      // 不合格のときは灰色、そうでないときは通常のスタイル（またはCSSクラスで制御）
                      backgroundColor:
                        item.result === "不合格" ? "#cccccc" : "",
                      color: item.result === "不合格" ? "#666666" : "",
                      cursor:
                        item.result === "不合格" ? "not-allowed" : "pointer",
                      opacity: item.result === "不合格" ? 0.6 : 1,
                    }}
                  >
                    賞状PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="modal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <h2>登録内容の確認</h2>
            <p>名前: {formData.name}</p>
            <p>所属: {formData.group}</p>
            <p>番号: {formData.number}</p>
            <p>合否: {formData.result}</p>

            <div className="buttonArea">
              <button
                type="button"
                className="cancelButton"
                onClick={handleCancel}
              >
                キャンセル
              </button>

              <button
                className="submitButton"
                type="submit"
                disabled={!isFormValid}
                autoFocus
                style={{
                  backgroundColor: !isFormValid ? "#cccccc" : "#4CAF50",
                  color: "white",
                  cursor: !isFormValid ? "not-allowed" : "pointer",
                  opacity: !isFormValid ? 0.6 : 1,
                }}
              >
                登録 (Enter)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✏️ 編集モーダル */}
      {isEditModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>データの編集</h2>
            <p>名前:</p>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <p>所属:</p>
            <select
              value={editingItem.group}
              onChange={(e) =>
                setEditingItem({ ...editingItem, group: e.target.value })
              }
            >
              <option value="営業部">営業部</option>
              <option value="総務部">総務部</option>
              <option value="経理部">経理部</option>
              <option value="企画部">企画部</option>
              <option value="技術部">技術部</option>
            </select>
            <p>番号:</p>
            <input
              type="number"
              value={editingItem.number}
              onChange={(e) =>
                setEditingItem({ ...editingItem, number: e.target.value })
              }
            />
            <p>合否:</p>
            <select
              value={editingItem.result}
              onChange={(e) =>
                setEditingItem({ ...editingItem, result: e.target.value })
              }
            >
              <option value="合格">合格</option>
              <option value="不合格">不合格</option>
            </select>
            <p>認定日（発行日）:</p>
            <input
              type="text"
              value={editingItem.date || ""} // 日付データがない場合の保険として || "" をつけておきます
              onChange={(e) =>
                setEditingItem({ ...editingItem, date: e.target.value })
              }
            />
            <div className="modalButtons">
              <button
                className="cancelButton"
                onClick={() => setIsEditModalOpen(false)}
              >
                キャンセル
              </button>
              <button className="submitButton" onClick={handleUpdate}>
                更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ 削除確認モーダル */}
      {isDeleteModalOpen && deletingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>削除の確認</h2>
            <p>「{deletingItem.name}」さんのデータを削除しますか？</p>

            <div className="modalButtons">
              <button
                className="cancelButton"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                キャンセル
              </button>
              <button className="deleteButton" onClick={handleDelete}>
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 賞状プレビュー＆印刷モーダル */}
      {isCertModalOpen && certificateItem && (
        <div className="modal-overlay">
          <div className="certificate-modal-content">
            {/* 🖨️ 印刷時にはボタンなどは隠して、この中身だけがPDFになります */}
            <div className="certificate-sheet">
              <h1 className="cert-title">合 格 証</h1>
              <p className="cert-name">{certificateItem.name} 様</p>
              <p className="cert-info">所属：{certificateItem.group}</p>
              <p className="cert-info">番号：{certificateItem.number}</p>
              {/* 💡 適当に作成した賞状の文面 */}
              <div className="cert-body">
                <p className="cert-text">
                  あなたは
                  {certificateItem.date
                    ? certificateItem.date.split("年")[0] + "年度"
                    : "令和年度"}{" "}
                  業務技術者認定試験において
                  <br />
                  所定の成績を収め見事に合格されましたので <br />
                  ここにその実力を讃えこれを証します。
                </p>
              </div>

              {/* 💡 発行日と発行団体名 */}
              <div className="cert-footer">
                <p className="cert-date">
                  {certificateItem.date || "令和〇年〇月〇日"}
                </p>
                <p className="cert-org">一般社団法人 日本高度技術推進協会</p>
              </div>
            </div>

            <div className="modalButtons no-print">
              <button onClick={() => setIsCertModalOpen(false)}>閉じる</button>
              <button className="submitButton" onClick={handlePrint}>
                PDFとして保存（印刷）
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
