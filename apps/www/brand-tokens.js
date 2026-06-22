/* ============================================================
   KH.group — BRAND TOKENS  ·  single source of truth
   ------------------------------------------------------------
   This file is the ONE place brand colours live. The public
   site (kh.group) and the brand manual (brandmanual.kh.group)
   both read from it, so changing a colour here changes it
   everywhere automatically.

   In production this file is served from a shared location
   (e.g. brandmanual.kh.group/brand-tokens.js) and the site
   loads it with <script src="…">. Editing a project's colour
   in the brand manual writes to this file → the .group tiles
   and the rotating palette update on next load.

   MODEL
     palette  — the group accent colours that rotate on the
                homepage (the shared "DNA": same chroma/lightness,
                different hue).
     worlds   — each business world has ONE family accent.
                Every brand inherits its world's accent unless
                it sets its own override (3rd item).
     brand    — [ name, domain, overrideColour?, directLink? ]
   ============================================================ */
window.KH_TOKENS = {

  palette: ['#FF6000', '#5B8DEF', '#C9A24A', '#DE0A96'],

  worlds: [
    { name: 'Robotics',      accent: '#FF6000', brands: [
      ['PhotoRobot',          'photorobot.com'],
      ['uni-Robot',           'uni-robot.com']
    ]},
    { name: 'Manufacturing',  accent: '#FF6000', brands: [
      ['sheetparts',          'sheetparts.com', '#9aa3ab'],
      ['sls.market',          'sls.market'],
      ['prototype.builders',  'prototype.builders']
    ]},
    { name: 'Orchestration',  accent: '#5B8DEF', brands: [
      ['flowsmith',           'flowsmith.online']
    ]},
    { name: 'Living',         accent: '#C9A24A', brands: [
      ['bestpenthouse',       'bestpenthouse.cz'],
      ['strizkov.apartments', 'strizkov.apartments'],
      ['strelnicna',          'strelnicna.cz'],
      ['mysak.studio',        'mysak.studio', '#9b9387']
    ]},
    { name: 'Travel',         accent: '#C9A24A', brands: [
      ['madhouse',            'madhouse.vip']
    ]},
    { name: 'Care',           accent: '#DE0A96', brands: [
      ['PhotoRobot Medical',  'cases.photorobot.io', null, 'https://cases.photorobot.io/breast-cancer-care/']
    ]}
  ]
};
