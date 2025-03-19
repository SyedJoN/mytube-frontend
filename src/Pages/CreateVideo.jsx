import { useMutation } from "@tanstack/react-query";
import { publishVideo } from "../apis/videoFn";

function UploadVideo() {
  const mutation = useMutation((formData) =>
    publishVideo(formData)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="videoFile" required />
      <button type="submit">Upload Video</button>
    </form>
  );
}

export default UploadVideo;