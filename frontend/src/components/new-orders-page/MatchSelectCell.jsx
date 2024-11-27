export const MatchSelectCell = ({ matches, selectedMatch, onChange, index }) => {
    const sortedMatches = matches ? 
      [...matches].sort((a, b) => b.score - a.score) : 
      [];
  
    return (
      <td className="border border-gray-300">
        <select
          className="w-full p-1"
          value={selectedMatch || ""}
          onChange={(e) =>
            onChange({
              type: "UPDATE_EXTRACTED_DATA",
              payload: {
                index,
                field: "selectedMatch",
                value: e.target.value,
              },
            })
          }
        >
          <option value="">Select a match...</option>
          {sortedMatches.map((match, idx) => (
            <option key={idx} value={match.match}>
              {match.match} ({match.score.toFixed(2)}%)
            </option>
          ))}
        </select>
      </td>
    );
  };