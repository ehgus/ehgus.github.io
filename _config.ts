import lume from "lume/mod.ts";
import sass from "lume/plugins/sass.ts";
import minifyHTML from "lume/plugins/minify_html.ts";

const site = lume({
    src: "src",
});

site 
    .use(sass())
    .use(minifyHTML());

site.copy("images")

export default site;
