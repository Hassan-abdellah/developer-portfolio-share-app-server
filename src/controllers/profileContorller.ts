import { type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { Platform } from "../generated/prisma/enums";

type linkType = {
  link_type: Platform;
  link_url: string;
};

// create profile
export const createProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    //   desturcutre the body of the request

    const { title, description, skills, links } = req.body;

    await prisma.profile.create({
      data: {
        clerkId: clerkId,
        title,
        description,
        skills,
        links: {
          createMany: {
            data: links.map((item: linkType) => {
              return {
                link_type: item?.link_type,
                link_url: item?.link_url,
              };
            }),
          },
        },
      },
      include: {
        links: true,
      },
    });

    res.status(201).json({ status: true, message: "Created Successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: error });
  }
};
