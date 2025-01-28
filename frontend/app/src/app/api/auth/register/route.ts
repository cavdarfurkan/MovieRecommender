import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import axios from "axios";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	const { name, email, password } = await request.json();

	if (!email || !password) {
		return NextResponse.json(
			{ message: "Email and password are required." },
			{ status: 400 }
		);
	}

	// Check if user already exists
	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		// Check if existsting user also exists on the backend, if not create it
		const existingUserOnBackend = await axios.get(
			`http://0.0.0.0:8000/users/${existingUser.id}`
		);
		if (!existingUserOnBackend) {
			await axios.post("http://0.0.0.0:8000/users", {
				user_id: existingUser.id,
			});
		}

		return NextResponse.json(
			{ message: "User already exists." },
			{ status: 400 }
		);
	}

	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Create the user
	try {
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		// Also create the user on backend
		await axios.post("http://0.0.0.0:8000/users", {
			user_id: user.id,
		});

		return NextResponse.json(
			{ message: "User created successfully.", user },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Internal server error.", error },
			{ status: 500 }
		);
	}
}
