/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead, d as addAttribute } from '../../chunks/astro/server_D4E0edJp.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BFi9kjb1.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$name = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$name;
  const { name } = Astro2.params;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const pokemon = await response.json();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pokemon.name, "data-astro-cid-f4iuhklh": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-gradient capitalize mb-4" data-astro-cid-f4iuhklh>${pokemon.name}</h1> <div class="flex flex-col items-center justify-center" data-astro-cid-f4iuhklh> <img${addAttribute(pokemon.sprites.other.dream_world.front_default, "src")}${addAttribute(pokemon.name, "alt")} class="h-48 w-auto" data-astro-cid-f4iuhklh> <div class="flex flex-row gap-2 mt-4 mb-4 justify-center" data-astro-cid-f4iuhklh> ${pokemon.types.map((type) => renderTemplate`<div class="badge badge-outline" data-astro-cid-f4iuhklh>${type.type.name}</div>`)} </div> </div> ` })} `;
}, "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/pages/pokemons/[name].astro", void 0);

const $$file = "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/pages/pokemons/[name].astro";
const $$url = "/pokemons/[name]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$name,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
