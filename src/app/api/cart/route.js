import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const filePath = path.join(process.cwd(), "data", "db.json");

async function readData() {
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

async function writeData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.cart || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newItem = await request.json();
    const data = await readData();

    if (!data.cart) data.cart = [];

    const existingIndex = data.cart.findIndex(item => item.id === newItem.id);

    if (existingIndex !== -1) {
      data.cart[existingIndex].quantity += 1;
    } else {
      data.cart.push({ ...newItem, quantity: 1 });
    }

    await writeData(data);

    return NextResponse.json(data.cart);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, quantity } = await request.json();

    if (!id || quantity == null) {
      return NextResponse.json({ error: "Missing id or quantity" }, { status: 400 });
    }

    const data = await readData();

    const itemIndex = data.cart.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    data.cart[itemIndex].quantity = quantity;

    await writeData(data);

    return NextResponse.json(data.cart[itemIndex]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const data = await readData();

    const newCart = data.cart.filter(item => item.id !== id);

    if (newCart.length === data.cart.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    data.cart = newCart;

    await writeData(data);

    return NextResponse.json({ message: "Item removed successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
