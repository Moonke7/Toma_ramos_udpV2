export default function ChangeColor({ color, setColor }) {
  const handleChange = (e) => {
    setColor(e.target.value);
  };

  return (
    <>
      <input
        type="color"
        id="colorPicker"
        value={color}
        onChange={handleChange}
      />
    </>
  );
}
