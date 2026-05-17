import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../utils/authUtils";
import { isRequestParamsMissing } from "../utils/requestUtils";

interface projectTypeData {
  title: string;
  description: string;
  preview_url?: string;
  image?: string;
  profile_id: string;
}

// create porject
export const createProject = async (req: Request, res: Response) => {
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  if (!req.body) {
    return res.status(400).json({ status: false, message: "No Body Provided" });
  }
  try {
    //   desturcutre the body of the request

    const { title, description, image, preview_url, profile_id } =
      req.body as projectTypeData;

    // For File Upload
    const rawUrl = req.file?.path;
    const image_url = rawUrl ? rawUrl : "";

    // get the profile to ensusre that the logged in user profile is equal to the profile id in request
    const profile = await prisma.profile.findUnique({
      where: { clerkId },
    });

    if (profile?.id !== profile_id) {
      return res.status(403).json({
        status: false,
        message: "You can’t Add Project to this Profile",
      });
    }
    await prisma.project.create({
      data: {
        profileId: profile_id,
        title,
        description,
        image_url: image_url,
        preview_url: preview_url,
      },
    });

    res.status(201).json({ status: true, message: "Created Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// update project
export const updateProject = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const projectId = isRequestParamsMissing(req, res, "Project");
  if (!projectId) return;

  if (!req.body) {
    return res.status(400).json({ status: false, message: "No Body Provided" });
  }

  try {
    //   desturcutre the body of the request
    const { title, description, image, preview_url, profile_id } =
      req.body as projectTypeData;

    // check if the profile already exists

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    // For File Upload
    const rawUrl = req.file?.path;
    const image_url = rawUrl ? rawUrl : project?.image_url;

    if (!project || project.profile.clerkId !== clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Project Found with that ID" });
    }
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        profileId: profile_id,
        title,
        description,
        preview_url: preview_url,
        image_url: image_url,
      },
    });

    res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// get All projects for profile
export const getProfileProjects = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;

  try {
    const profile = await prisma.profile.findUnique({
      where: { clerkId },
      include: { projects: true },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }

    return res.status(200).json({ status: true, projects: profile.projects });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// get project
export const getProject = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const projectId = isRequestParamsMissing(req, res, "Project");
  if (!projectId) return;

  try {
    // check if the profile already exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        profile: true,
      },
    });
    if (!project || project.profile.clerkId !== clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }

    return res.status(200).json({ status: true, project });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// DELETE project
export const deleteProject = async (req: Request, res: Response) => {
  // check if the clerk id is presented in request
  const clerkId = requireAuth(req, res);
  if (!clerkId) return;
  // check if the Id is Presented in the URL params or not
  const projectId = isRequestParamsMissing(req, res, "Project");
  if (!projectId) return;

  try {
    // check if the profile already exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        profile: true,
      },
    });

    // get the profile for this user
    if (!project || project.profile.clerkId !== clerkId) {
      return res
        .status(404)
        .json({ status: false, message: "No Profile Found with that ID" });
    }
    // check if the profile already exists
    await prisma.project.delete({
      where: { id: projectId },
    });
    return res
      .status(200)
      .json({ status: true, message: "Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
