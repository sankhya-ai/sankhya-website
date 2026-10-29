import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { GitHubMark } from '@/site/components/atoms/GitHubMark';
import { MemoryField } from '@/site/components/molecules/MemoryField';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { DheeContrast } from '@/site/features/dhee/DheeContrast';
import { DheeLayers } from '@/site/features/dhee/DheeLayers';
import { DheeMetrics } from '@/site/features/dhee/DheeMetrics';
import { DheeRules } from '@/site/features/dhee/DheeRules';
import { FieldLegend } from '@/site/features/dhee/FieldLegend';

const DHEE_GITHUB = 'https://github.com/tura-learn/Dhee';
const TURA_START = 'https://www.turalearn.com/login';

/**
 * Dhee, as the memory a tutor needs.
 *
 * The page makes one argument and makes it with the product's own picture:
 * remembering a conversation is not the same as remembering a learner. Every
 * rule it states is a rule the tutor actually runs by — reading is not
 * learning, not asked is not weak, forgetting is modelled, preferences come
 * only in the student's own words, and nothing aggregate is stored — so none
 * of it needs a caveat.
 */
export function DheePage() {
  return (
    <div className="lab-tone dhee-page" id="top">
      <SiteHeader />
      <main>
        <section className="dhee-hero" aria-labelledby="dhee-hero-title">
          <div className="dhee-hero__copy">
            <p className="dhee-hero__eyebrow"><span aria-hidden="true" />Dhee · open source, from Sankhya AI Labs</p>
            <h1 id="dhee-hero-title">A tutor should remember <em>what you know,</em> not what you said.</h1>
            <p>
              Dhee keeps every page you read and every answer you give as a fact, then works out, fresh every
              time, what is holding, what is slipping, and what nobody has asked you yet.
            </p>
            <div className="dhee-hero__actions">
              <ButtonLink href={TURA_START}>Start learning in Tura</ButtonLink>
              <ButtonLink href={DHEE_GITHUB} tone="outline" target="_blank" rel="noopener noreferrer" className="dhee-github">
                <GitHubMark /> View Dhee on GitHub
              </ButtonLink>
            </div>
          </div>

          <figure className="dhee-hero__field" data-snap>
            <MemoryField className="dhee-hero__canvas" />
            <figcaption>
              <span>One student’s library, as Tura draws it. Each ring is a topic; each dot around it, one key point.</span>
              <FieldLegend />
            </figcaption>
          </figure>
        </section>

        <DheeMetrics />
        <DheeContrast />
        <DheeRules />
        <DheeLayers />

        <section className="dhee-closing">
          <img src="/art/learning-by-doing.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async" />
          <div>
            <h2>A good tutor remembers <em>you.</em></h2>
            <p>Bring your notes and your papers. Dhee will remember the rest.</p>
            <div className="dhee-closing__actions">
              <ButtonLink href={TURA_START}>Start learning in Tura</ButtonLink>
              <ButtonLink href={DHEE_GITHUB} tone="outline" target="_blank" rel="noopener noreferrer" className="dhee-github">
                <GitHubMark /> Dhee on GitHub
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
