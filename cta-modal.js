(function () {
  'use strict';

  var copy = {
    en: {
      ecosystem: {
        label: 'Early Access Program',
        title: 'Become an Early Tester',
        sub: "Get exclusive first access to our internal ventures — Accesorios TRD, Snapay, and Vorzana. We'll reach out with onboarding details.",
        features: ['Priority access before public launch', 'Direct feedback channel with founders', 'Exclusive early-adopter benefits'],
        cta: 'Book a Call &rarr;',
        dismiss: 'No thanks, close'
      },
      services: {
        label: 'Start a Project',
        title: 'Let\'s Build Something Great',
        sub: "Tell us what you're building and we'll send a roadmap, estimate, and risk assessment within 72 hours.",
        features: ['Response within 24 hours', 'No-commitment discovery call', 'Fixed-price or retainer models'],
        cta: 'Book a 30-min Discovery Call &rarr;',
        dismiss: 'No thanks, close'
      }
    },
    es: {
      ecosystem: {
        label: 'Programa de Acceso Anticipado',
        title: 'Convi&eacute;rtete en Tester Anticipado',
        sub: 'Obt&eacute;n acceso exclusivo y anticipado a nuestros ventures internos &mdash; Accesorios TRD, Snapay y Vorzana. Te contactaremos con los detalles.',
        features: ['Acceso prioritario antes del lanzamiento p&uacute;blico', 'Canal de feedback directo con los fundadores', 'Beneficios exclusivos de early adopter'],
        cta: 'Agenda una Llamada &rarr;',
        dismiss: 'No gracias, cerrar'
      },
      services: {
        label: 'Iniciar un Proyecto',
        title: 'Construyamos Algo Grande',
        sub: 'Cu&eacute;ntanos qu&eacute; est&aacute;s construyendo y te enviaremos un roadmap, estimado y an&aacute;lisis de riesgos en 72 horas.',
        features: ['Respuesta en menos de 24 horas', 'Llamada de discovery sin compromiso', 'Modelos de precio fijo o retainer'],
        cta: 'Agenda una Llamada de 30 min &rarr;',
        dismiss: 'No gracias, cerrar'
      }
    }
  };

  var overlay = null;

  function getLang() {
    try { return localStorage.getItem('cd_lang') === 'es' ? 'es' : 'en'; } catch (_) { return 'en'; }
  }

  function build(page) {
    var l = getLang();
    var langCopy = copy[l] || copy.en;
    var c = langCopy[page] || langCopy.services;

    var featuresHtml = c.features.map(function (f) {
      return '<div class="cta-modal-feature">' + f + '</div>';
    }).join('');

    overlay = document.createElement('div');
    overlay.id = 'cta-modal-overlay';
    overlay.innerHTML =
      '<div id="cta-modal-bg"></div>' +
      '<div id="cta-modal-card">' +
        '<button class="cta-modal-close" aria-label="Close">&times;</button>' +
        '<p class="cta-modal-label">' + c.label + '</p>' +
        '<h3 class="cta-modal-title">' + c.title + '</h3>' +
        '<p class="cta-modal-sub">' + c.sub + '</p>' +
        '<div class="cta-modal-divider"></div>' +
        featuresHtml +
        '<div class="cta-modal-divider"></div>' +
        '<a href="https://calendly.com/corosdev-info/30min" target="_blank" rel="noopener noreferrer" class="cta-modal-cta">' + c.cta + '</a>' +
        '<button class="cta-modal-dismiss">' + c.dismiss + '</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.querySelector('#cta-modal-bg').addEventListener('click', closeCtaModal);
    overlay.querySelector('.cta-modal-close').addEventListener('click', closeCtaModal);
    overlay.querySelector('.cta-modal-dismiss').addEventListener('click', closeCtaModal);
    document.addEventListener('keydown', onEsc);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (overlay) overlay.classList.add('active');
      });
    });
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeCtaModal();
  }

  window.openCtaModal = function (page) {
    if (overlay) { closeCtaModal(true); }
    build(page || 'services');
  };

  window.closeCtaModal = function (immediate) {
    if (!overlay) return;
    document.removeEventListener('keydown', onEsc);
    document.body.style.overflow = '';
    if (immediate) {
      overlay.remove();
      overlay = null;
      return;
    }
    overlay.classList.remove('active');
    var el = overlay;
    setTimeout(function () {
      if (el && el.parentNode) el.remove();
      if (overlay === el) overlay = null;
    }, 380);
  };
})();
