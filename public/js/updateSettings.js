import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async (data, type) => {
  // if (!email || !password) return;

  // type is either password or data

  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    // console.log(res);
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
