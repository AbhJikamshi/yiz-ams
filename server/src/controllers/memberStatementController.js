import * as memberStatementService from "../services/memberStatementService.js";
import { generateMemberStatementPDF } from "../pdf/memberStatementPdf.js";

export const downloadStatement = async (req, res, next) => {
  try {
    const statement =
      await memberStatementService.getMemberStatement(
        req.member.id
      );

    if (!statement) {
      return res.status(404).json({
        success: false,
        message: "Member statement not found.",
      });
    }

    return await generateMemberStatementPDF(
      res,
      statement
    );
  } catch (error) {
    next(error);
  }
};