export const EditableCell = ({ value, onChange, field, index }) => (
    <td className="border border-gray-300">
      <input
        type="text"
        className="w-full p-1"
        value={value || ""}
        onChange={(e) =>
          onChange({
            type: "UPDATE_EXTRACTED_DATA",
            payload: {
              index,
              field,
              value: e.target.value,
            },
          })
        }
      />
    </td>
  );