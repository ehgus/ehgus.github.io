import lume from "lume/mod.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import minifyHTML from "lume/plugins/minify_html.ts";

const site = lume({
    src: "./src",
});

site 
    .use(lightningCss())
    .use(minifyHTML());

export default site;
