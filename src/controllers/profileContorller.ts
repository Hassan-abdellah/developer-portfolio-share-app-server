import { type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { Platform } from "../generated/prisma/enums";

type linkType = {
  link_type: Platform;
  link_url: string;
};

interface profileBodyData {
  title: string;
  description: string;
  skills: string[];
  links: linkType[];
}
interface profileShareBody {
  is_sharable: boolean;
}

// create profile
export const createProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    //   desturcutre the body of the request

    const { title, description, skills, links } = req.body as profileBodyData;

    if (!req.body) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }
    // get any profile with this clerk id first to ensusre the user has no profile
    const profile = await prisma.profile.findUnique({ where: { clerkId } });
    // if profile already exists with this clerk id return
    if (profile) {
      return res.status(401).json({
        status: false,
        message: "Profile For this user already exists",
      });
    }

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
    return res.status(500).json({ error: error });
  }
};

// update profile
export const updateProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    const profileId = req.params.id as string;

    //   desturcutre the body of the request
    const { title, description, skills, links } = req.body as profileBodyData;

    if (!profileId) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }

    if (!req.body) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }
    // check if the profile already exists

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || clerkId !== profile.clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    await prisma.profile.update({
      where: {
        id: profileId,
      },
      data: {
        clerkId: clerkId,
        title,
        description,
        skills,
        links: {
          deleteMany: {},
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

    res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// get profile
export const getProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    const profileId = req.params.id as string;

    if (!profileId) {
      return res.status(404).json({ status: false, message: "Undefeined ID" });
    }

    // check if the profile already exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        links: true,
        user: true,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    if (!profile.is_sharable) {
      return res.status(403).json({
        status: false,
        message: "You don’t have the permission to View This Page",
      });
    }

    return res.status(200).json({ status: true, profile: profile });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
// get profile
// get my profile
export const getMyProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }
  try {
    // check if the profile already exists
    const profile = await prisma.profile.findUnique({
      where: { clerkId },
      include: {
        links: true,
        user: true,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Assign To You" });
    }

    return res.status(200).json({ status: true, profile: profile });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// share profile
// to toggle Profile sharable ability on / off
export const shareProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    const profileId = req.params.id as string;

    if (!profileId) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }

    //   desturcutre the body of the request
    const { is_sharable } = req.body as profileShareBody;

    if (!req.body) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }
    // check if the profile already exists

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || clerkId !== profile.clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    await prisma.profile.update({
      where: {
        id: profileId,
      },
      data: {
        is_sharable: is_sharable,
      },
    });

    res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// upload  profile CSV
// to toggle Profile sharable ability on / off
export const uploadProfileCSV = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    const profileId = req.params.id as string;

    if (!profileId) {
      return res
        .status(401)
        .json({ status: false, message: "No Body Provided" });
    }

    // check if the profile already exists

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || clerkId !== profile.clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    const rawUrl = req.file?.path;
    const pdfUrl = rawUrl?.replace("/image/upload/", "/raw/upload/");

    const csvUrl = pdfUrl ? pdfUrl : profile.csv_url;

    console.log("csvURL", csvUrl);
    await prisma.profile.update({
      where: {
        id: profileId,
      },
      data: {
        csv_url: csvUrl,
      },
    });

    res
      .status(200)
      .json({ status: true, message: "CSV Uploaded Succesfully Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// DELETE Profile
export const deleteProfile = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return res.status(401).json({ status: false, message: "unauthenticated" });
  }

  try {
    const profileId = req.params.id as string;
    if (!profileId) {
      return res.status(404).json({ message: "undefined ID" });
    }
    // check if the profile already exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile || clerkId !== profile.clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    // check if the profile already exists
    await prisma.profile.delete({
      where: { id: profileId },
    });
    return res
      .status(200)
      .json({ status: true, message: "Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
