import express from "express";
import authSeller from "../middlewares/authSeller.js";
import { getSellerInvoices, getSellerInvoiceDetail } from "../controllers/invoiceController.js";

const invoiceRouter = express.Router();

invoiceRouter.get("/seller", authSeller, getSellerInvoices);
invoiceRouter.get("/seller/:id", authSeller, getSellerInvoiceDetail);

export default invoiceRouter;