import { useMutation } from "@tanstack/react-query";

function EditVideo({ id }) {
  const mutation = useMutation((data) =>
    fetch(`/api/edit/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { title: e.target.title.value, description: e.target.description.value };
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="New Title" required />
      <input type="text" name="description" placeholder="New Description" required />
      <button type="submit">Update</button>
    </form>
  );
}
