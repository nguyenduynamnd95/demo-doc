import { loginAsAdmin } from "@/services/server/kintone"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('aaaaa');
  
  const { usn, pwd } = await request.json();

  try {
    const data = await loginAsAdmin(usn, pwd);

    if (data) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
