import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { listReviews } from '../../services/api/reviews';
import { REVIEW_RATINGS, REVIEW_STATUS_LABELS, reviewStatusLabel, reviewStatusTone } from './reviewUtils';

function Rating({ value }) {
  return <span aria-label={`${value} out of 5 stars`} className="tw-font-medium tw-text-[var(--c-warning-ink)]">{value}/5</span>;
}

export default function ReviewsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const rating = params.get('rating') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((current) => {
        if (searchInput.trim()) current.set('search', searchInput.trim());
        else current.delete('search');
        return current;
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  useEffect(() => {
    let active = true;
    listReviews({ search, status, rating }).then((result) => {
      if (active) setReviews(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load reviews.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [search, status, rating]);

  const setFilter = (key, value) => {
    setLoading(true);
    setError('');
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Reviews</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search reviews</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search product, customer, or review..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter review status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-max-w-[150px]" aria-label="Filter review rating" value={rating} onChange={(event) => setFilter('rating', event.target.value)}>
          <option value="">All ratings</option>
          {REVIEW_RATINGS.map((value) => <option key={value} value={value}>{value}/5</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading reviews" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
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
