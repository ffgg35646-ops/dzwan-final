
import { Router } from "../http/native-http.js";
import { getAppUpdateInfo } from "../controllers/app-update.controller.js";

const router = Router();

router.get(
  "/",
  getAppUpdateInfo,
);

export default router;
