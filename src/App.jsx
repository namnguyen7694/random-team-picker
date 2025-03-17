import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { GrClear } from "react-icons/gr";
import { roundRobin } from "./util";

const RandomTeamPicker = () => {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [maxPeoplePerGroup, setMaxPeoplePerGroup] = useState(2);
  const [inputValue, setInputValue] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasResults = localStorage.getItem("teamPickerData") !== null;

  const saveToLocalStorage = (names, teams, matches) => {
    localStorage.setItem(
      "teamPickerData",
      JSON.stringify({ savedMembers: names, savedTeams: teams, savedMatches: matches })
    );
  };

  useEffect(() => {
    if (hasResults) {
      const data = JSON.parse(localStorage.getItem("teamPickerData"));
      setMembers(data.savedMembers);
      setTeams(data.savedTeams);
      setMatches(data.savedMatches);
    }
  }, [hasResults]);

  const addMember = () => {
    if (inputValue.trim()) {
      const newMembers = inputValue
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .map((name) => ({ name, isStar: false }));

      setMembers((prev) => [...prev, ...newMembers]);
      setInputValue("");
    }
  };

  const removeMember = (name) => {
    setMembers((prev) => prev.filter((mem) => mem.name !== name));
  };
  const toggleStar = (name) => {
    setMembers((prev) => prev.map((mem) => (mem.name === name ? { ...mem, isStar: !mem.isStar } : mem)));
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const generateTeams = () => {
    if (isSpinning) return;

    if (hasResults) {
      if (!window.confirm("Xoá kết quả và chia team lại?")) {
        return;
      }
    }

    setIsSpinning(true);
    setTeams([]);
    setMatches([]);

    setTimeout(() => {
      let shuffledMembers = shuffleArray([...members]);
      let stars = shuffledMembers.filter((n) => n.isStar);
      let nonStars = shuffledMembers.filter((n) => !n.isStar);
      let groups = [];

      while (stars.length > 0 && nonStars.length >= maxPeoplePerGroup - 1) {
        let team = [stars.pop(), ...nonStars.splice(0, maxPeoplePerGroup - 1)];
        groups.push(team);
      }

      while (nonStars.length >= maxPeoplePerGroup) {
        groups.push(nonStars.splice(0, maxPeoplePerGroup));
      }

      setTeams(groups);
      generateMatches(groups);
      setIsModalOpen(true);
      setIsSpinning(false);
    }, 2000);
  };

  const generateMatches = (teams) => {
    const rounds = roundRobin(
      teams.length,
      teams.map((t, idx) => `Team ${idx + 1}`)
    );    
    const matchDays = rounds.map((r) => r.map((m) => ({ home: m[0], away: m[1] })));
    setMatches(matchDays.reverse());
    saveToLocalStorage(members, teams, matchDays);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-200">
      <div className="container mx-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-600">Mỹ Phúc Pick Open 2025</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Báo thủ"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addMember()}
              className="border p-2 flex-1 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300 border-gray-500"
            />
            <button
              onClick={addMember}
              className="bg-cyan-500 text-white font-bold px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300 cursor-pointer"
            >
              Thêm
            </button>
          </div>
          <ul className="overflow-y-auto max-h-90 mb-4">
            {members.map((mem, index) => (
              <li key={index} className="flex justify-between p-2 bg-gray-100 font-semibold rounded-md mb-1">
                {index + 1}. {mem.name}
                <FaStar
                  className={`ml-auto mr-5 cursor-pointer text-lg ${mem.isStar ? "text-yellow-400" : "text-gray-400"}`}
                  onClick={() => toggleStar(mem.name)}
                />
                <GrClear onClick={() => removeMember(mem.name)} className="text-lg text-red-500 cursor-pointer" />
              </li>
            ))}
          </ul>
          <div className="mb-4">
            <label className="block font-semibold">Số thành viên/đội:</label>
            <input
              type="number"
              value={maxPeoplePerGroup}
              onChange={(e) => setMaxPeoplePerGroup(e.target.value)}
              className="border p-2 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300 border-gray-500"
            />
          </div>
          <button
            onClick={generateTeams}
            disabled={isSpinning}
            className={`cursor-pointer px-4 py-2 w-full rounded-md shadow-md transition duration-300 ${
              isSpinning ? "bg-gray-400 cursor-not-allowed" : "bg-amber-400 font-bold text-white hover:bg-amber-600"
            }`}
          >
            {isSpinning ? "Đang sắp đội..." : "Chia team"}
          </button>

          {hasResults && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer px-4 mt-2 py-2 w-full bg-sky-400 hover:bg-sky-600 text-white font-bold rounded-md"
            >
              Xem kết quả
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="absolute inset-0 bg-gray-600 opacity-50 backdrop-blur-md"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-2 text-center text-gray-700">Kết quả</h3>
            <ul>
              {teams.map((team, index) => (
                <li key={index} className="p-2 mb-2 bg-gray-200 rounded-lg shadow flex">
                  <h4 className="font-bold mr-2">Team {index + 1}: </h4>
                  {team.map((mem, idx) => (
                    <div key={idx} className="flex items-center">
                      <p className={`mr-2 ml-2 ${mem.isStar ? "text-yellow-600 font-bold" : ""}`}>{mem.name}</p>
                      {mem.isStar && <FaStar className="text-yellow-600" />}
                      {idx !== team.length - 1 && <span className="mr-2 ml-2">|</span>}
                    </div>
                  ))}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-3 text-gray-700 text-center">Lịch thi đấu</h3>
            <ul className="overflow-y-auto max-h-90">
              {matches.map((matchDay, index) => (
                <div key={index} className="mb-3 p-1 bg-slate-100 shadow rounded-md">
                  <h4 className="font-bold text-center text-slate-700 text-sm">Lượt trận {index + 1}</h4>
                  <ul>
                    {matchDay.map((match, idx) => (
                      <li key={idx} className="p-1 text-center text-dark-700 text-sm">
                        {match.home} vs {match.away}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ul>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-red-400 text-white px-4 py-2 w-full rounded-md mt-4 hover:bg-red-600 transition duration-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomTeamPicker;
