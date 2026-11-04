import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { listReviews } from '../../services/api/reviews';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { REVIEW_RATINGS, REVIEW_STATUS_LABELS, reviewStatusLabel, reviewStatusTone } from './reviewUtils';

const NO_REVIEWS = [];
const QUERY = { search: '', status: '', rating: '' };

function Rating({ value }) {
  return <span aria-label={`${value} out of 5 stars`} className="tw-font-medium tw-text-[var(--c-warning-ink)]">{value}/5</span>;
}

export default function ReviewsPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { status, rating } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listReviews, query);
  const reviews = result?.data ?? NO_REVIEWS;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Reviews</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search reviews</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search product, customer, or review..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter review status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-max-w-[150px]" aria-label="Filter review rating" value={rating} onChange={(event) => setQuery({ rating: event.target.value })}>
          <option value="">All ratings</option>
          {REVIEW_RATINGS.map((value) => <option key={value} value={value}>{value}/5</option>)}
        </select>
      </div>
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load reviews." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading reviews" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[1050px]">
          <caption className="visually-hidden">Product reviews</caption>
          <thead><tr>{['Product', 'Customer', 'Rating', 'Review', 'Submitted', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{reviews.map((review) => <tr key={review.id}>
            <td className="tw-font-medium">{review.productName}</td>
            <td><div>{review.customer.name}</div><div className="tw-text-xs tw-text-muted">{review.customer.email}</div></td>
            <td><Rating value={review.rating} /></td>
            <td><div className="tw-font-medium">{review.title}</div><div className="tw-max-w-[420px] tw-text-sm tw-text-muted">{review.body}</div></td>
            <td>{new Date(review.createdAt).toLocaleDateString()}</td>
            <td><Pill tone={reviewStatusTone(review.status)}>{reviewStatusLabel(review.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!reviews.length && <p className="tw-py-8 tw-text-center tw-text-muted">No reviews found.</p>}
      </div>}
    </Card>
  </div>;
}
