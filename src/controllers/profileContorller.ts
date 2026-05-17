import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { Platform } from "../generated/prisma/enums";
import { requireAuth } from "../utils/authUtils";
import { isRequestParamsMissing } from "../utils/requestUtils";

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

/** Find a profile by id and verify ownership. Returns null and sends response on failure. */
async function findOwnedProfile(
  profileId: string,
  clerkId: string,
  res: Response,
) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });

  if (!profile) {
    res.status(404).json({ status: false, message: "Profile not found" });
    return null;
  }

  if (profile.clerkId !== clerkId) {
    res.status(403).json({ status: false, message: "Forbidden" });
    return null;
  }

  return profile;
}

// create profile
export const createProfile = async (req: Request, res: Response) => {
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  try {
    //desturcutre the body of the request
    const { title, description, skills, links } = req.body as profileBodyData;
    // check if those fields not appiled in the body
    if (!title || !description || !skills || !links) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// update profile
export const updateProfile = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const profileId = isRequestParamsMissing(req, res, "Profile");
  if (!profileId) return;

  try {
    //   desturcutre the body of the request
    const { title, description, skills, links } = req.body as profileBodyData;

    // check if those fields not appiled in the body
    if (!title || !description || !skills || !links) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    // check if the profile already exists

    const profile = await findOwnedProfile(profileId, clerkId, res);
    if (!profile) return;

    // update the profile
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// get profile
export const getProfile = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const profileId = isRequestParamsMissing(req, res, "Profile");
  if (!profileId) return;

  try {
    // check if the profile already exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        links: true,
        user: true,
        projects: true,
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// get profile
// get my profile
export const getMyProfile = async (req: Request, res: Response) => {
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  try {
    // check if the profile already exists
    const profile = await prisma.profile.findUnique({
      where: { clerkId },
      include: {
        links: true,
        user: true,
        projects: true,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Assign To You" });
    }

    return res.status(200).json({ status: true, profile: profile });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// share profile
// to toggle Profile sharable ability on / off
export const shareProfile = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const profileId = isRequestParamsMissing(req, res, "Profile");
  if (!profileId) return;

  if (!req.body) {
    return res.status(400).json({ status: false, message: "No Body Provided" });
  }

  try {
    //   desturcutre the body of the request
    const { is_sharable } = req.body as profileShareBody;

    // check if the profile already exists

    const profile = await findOwnedProfile(profileId, clerkId, res);
    if (!profile) return;

    // update the profile
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// upload  profile CSV
// to toggle Profile sharable ability on / off
export const uploadProfileCSV = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const profileId = isRequestParamsMissing(req, res, "Profile");
  if (!profileId) return;

  if (!req.file?.path) {
    return res.status(400).json({ status: false, message: "No file uploaded" });
  }

  try {
    // check if the profile already exists
    const profile = await findOwnedProfile(profileId, clerkId, res);
    if (!profile) return;

    // Cloudinary stores CSVs under /raw/upload/, not /image/upload/
    const csvUrl = req.file.path.replace("/image/upload/", "/raw/upload/");
    // update profile
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE Profile
export const deleteProfile = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const profileId = isRequestParamsMissing(req, res, "Profile");
  if (!profileId) return;

  try {
    // check if the profile already exists
    const profile = await findOwnedProfile(profileId, clerkId, res);
    if (!profile) return;

    // delete the profile
    await prisma.profile.delete({
      where: { id: profileId },
    });
    return res
      .status(200)
      .json({ status: true, message: "Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
