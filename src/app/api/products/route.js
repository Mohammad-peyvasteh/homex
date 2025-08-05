import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  
  const jsonDirectory = path.join(process.cwd(), "data");
  const fileContents = await fs.readFile(jsonDirectory + "/db.json", "utf8");

  
  const data = JSON.parse(fileContents);

  return NextResponse.json(data.items);
}