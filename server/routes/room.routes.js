import express from "express";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from "../controllers/room.controller.js";

const router = express.Router();

router.get("/", getAllRooms);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

export default router;
