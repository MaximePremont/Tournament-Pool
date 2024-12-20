import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/firebase";
import withSession from "@/app/api/_helpers/middleware/with-session";
import { tournamentBody } from "@/app/api/_helpers/types/types";
import { Session } from "next-auth";

async function putHandler(req: NextRequest, session?: Session) {
  const body: tournamentBody = JSON.parse(await req?.text());
  const { name, teams, createdBy } = body;

  const createdAt = new Date();

  if (!name)
    return NextResponse.json(
      { error: "Name of tournament is required" },
      { status: 400 },
    );

  if (teams?.length < 2 || !teams)
    return NextResponse.json(
      { error: "Insufficient teams must be greater than 2 teams." },
      { status: 400 },
    );

  teams.forEach((team) => {
    if (!team?.name)
      return NextResponse.json(
        { error: "Name of a team is required" },
        { status: 400 },
      );
    if (!team?.color)
      return NextResponse.json(
        { error: "Color of a team is required" },
        { status: 400 },
      );
  });

  try {
    const document = await getDb().collection("tournaments").add({
      name,
      teams,
      createdBy,
      createdAt,
    });

    const user = await getDb()
      .collection("users")
      .doc(session?.user?.id || "")
      .get();

    const userData = user.data();

    let tournamentsId = userData?.tournamentsId;
    if (!tournamentsId) tournamentsId = [];

    tournamentsId.unshift(document.id);

    await getDb()
      .collection("users")
      .doc(session?.user?.id || "")
      .update({
        tournamentsId: tournamentsId,
      });

    return NextResponse.json({ id: document.id });
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");

  const skip = (page - 1) * limit;

  try {
    const tournamentsCountData = await getDb()
      .collection("tournaments")
      .count()
      .get();
    const totalCount = tournamentsCountData.data().count;

    const totalPages = Math.ceil(totalCount / limit);

    const tournamentsData = await getDb()
      .collection("tournaments")
      .orderBy("createdAt", "desc")
      .offset(skip)
      .limit(limit)
      .get();
    let tournaments = [];

    if (tournamentsData.empty)
      return NextResponse.json({ tournaments: [], totalPages });

    tournaments = tournamentsData.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      tournaments: tournaments,
      totalPages: totalPages,
    });
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return withSession(req, putHandler);
}
