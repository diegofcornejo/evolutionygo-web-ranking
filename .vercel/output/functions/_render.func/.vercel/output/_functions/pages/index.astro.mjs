/* empty css                                 */
import { c as createComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute, b as createAstro, a as renderComponent } from '../chunks/astro/server_D4E0edJp.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BFi9kjb1.mjs';
import { jsx } from 'react/jsx-runtime';
import { Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper as Swiper$1, SwiperSlide } from 'swiper/react';
import { toast } from 'sonner';
/* empty css                                 */
import 'clsx';
export { renderers } from '../renderers.mjs';

const slides = [
  {
    id: 1,
    image: "https://placehold.co/600x400/000000/FFFFFF/png"
  },
  {
    id: 2,
    image: "https://placehold.co/600x400/FF0000/FFFFFF/png"
  },
  {
    id: 3,
    image: "https://placehold.co/600x400/00FF00/FFFFFF/png"
  },
  {
    id: 4,
    image: "https://placehold.co/600x400/0000FF/FFFFFF/png"
  },
  {
    id: 5,
    image: "https://placehold.co/600x400/FF00FF/FFFFFF/png"
  },
  {
    id: 6,
    image: "https://placehold.co/600x400/FFFF00/FFFFFF/png"
  }
];
const handleToast = () => {
  toast.success("Hello, world!");
};
const Swiper = () => {
  return /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx(
    Swiper$1,
    {
      modules: [Pagination, A11y, Autoplay],
      spaceBetween: 50,
      slidesPerView: 1,
      autoplay: {
        delay: 5e3,
        disableOnInteraction: false
      },
      onSlideChange: () => console.log("slide change"),
      onSwiper: (swiper) => console.log(swiper),
      pagination: {
        clickable: true
      },
      children: slides.map((slide) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx("div", { className: "h-auto w-full bg-base-200 flex justify-center items-center", children: /* @__PURE__ */ jsx("img", { src: slide.image, alt: `Slide ${slide.id}`, width: 600, height: 400, onClick: handleToast, className: "cursor-pointer" }) }) }, slide.id))
    }
  ) });
};

const $$Astro = createAstro();
const $$PokemonCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PokemonCard;
  const { name } = Astro2.props;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await response.json();
  const image = data.sprites.other.dream_world.front_default;
  const types = data.types;
  return renderTemplate`${maybeRenderHead()}<div class="card bg-base-200 w-full shadow-xl cursor-pointer"${addAttribute(`window.location.href = '/pokemons/${name}'`, "onclick")}> <figure> <img${addAttribute(image, "src")}${addAttribute(name, "alt")} class="h-48 w-auto pt-8"> </figure> <div class="card-body"> <h2 class="card-title"> ${name} <div class="badge badge-secondary">NEW</div> </h2> <p>If a dog chews shoes whose shoes does he choose?</p> <div class="card-actions justify-end"> ${types.map((type) => renderTemplate`<div class="badge badge-outline">${type.type.name}</div>`)} </div> </div> </div>`;
}, "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/components/PokemonCard.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=12");
  const data = await response.json();
  const pokemons = data.results;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Evolution YGO Ranking", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main data-astro-cid-j7pv25f6> <!-- <Breadcrumb />
		<AvatarGroup size={12} avatars={[1,2,3,4,5,6,7,8,9,10]} maxShow={5} />
		<AvatarRing size={8} color='primary' />
		<AvatarRing size={8} color='secondary'/>
		<AvatarRing size={8} color='accent' />
		<AvatarIndicator size={8} online={true} />
		<AvatarIndicator size={8} online={false} /> --> <h1 data-astro-cid-j7pv25f6>Welcome to <span class="text-gradient" data-astro-cid-j7pv25f6>Evolution YGO Ranking</span></h1> ${renderComponent($$result2, "Swiper", Swiper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/components/Swiper", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} <ul role="list" class="link-card-grid" data-astro-cid-j7pv25f6> ${pokemons.map((pokemon) => renderTemplate`${renderComponent($$result2, "PokemonCard", $$PokemonCard, { "name": pokemon.name, "data-astro-cid-j7pv25f6": true })}`)} </ul> </main> ` })} `;
}, "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/pages/index.astro", void 0);

const $$file = "/Users/diego/personal/ygopro/evolutionygo-web-ranking/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
