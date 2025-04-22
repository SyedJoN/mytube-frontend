import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime); // Move this outside the function

function formatDate(dateString) {
  return dayjs(dateString).fromNow();
}

export default formatDate;
