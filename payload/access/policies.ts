import type { Access } from "payload";

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

export const isPublicRead: Access = () => true;
