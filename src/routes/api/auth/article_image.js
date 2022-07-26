import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import sharp from "sharp";

import * as fs from 'fs/promises';

export async function post({ request }) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}

    try {
        debugger;
        const formData = await request.formData().then(d => Object.fromEntries(d));
        const imgArrayBuffer = await formData.image.arrayBuffer();
        //const post_id = formData.get("post_id");
        //const image_name = formData.get("image_name");

        fs.mkdir(`./static/post_imgs/${formData.post_id}`, { recursive: true });
        await sharp(Buffer.from(imgArrayBuffer))
			.resize({ width: 315, height: 110 })
			.webp()
			.toFile(`./static/post_imgs/${formData.post_id}/${formData.img_name}`);
        return {
            body: {status: "success", message: `Successfully saved ${formData.img_name}`}
        }
    } catch (err) {
        console.log(err);
        return {status: 400, body: { error: err } };
    }
    /*
    const formData = await request.formData();
    const post_id = formData.get('post_id');
    const image_name = formData.get('image_name');
    const image_content = formData.get('image');
    await fs.writeFile(`static/post_imgs/${post_id}/${image_name}`, image_content.stream());
    */
}