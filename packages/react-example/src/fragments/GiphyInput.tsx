import { IGif } from '@giphy/js-types';
import React, { useCallback, useState } from 'react';
import {
  Dropdown,
  Icons,
  Input,
  ScrollView,
  StyledBox,
} from '@chatkitty/react-ui';
import {
  Gif,
  GifSize,
  GiphyMessagePlaceholder,
  giphyMessagePlaceholders,
  typedGiphyMasonry,
} from '@chatkitty/react-ui';
import { GetNextPage, useDebounce, usePagination } from '@chatkitty/react-ui';

import attribution from '../assets/images/giphy-attribution.png';

const GiphyMasonry = typedGiphyMasonry<IGif>();

const PAGE_SIZE = 25;
interface GiphySearch {
  data: IGif[];
  pagination: { total_count: number; count: number; offset: number };
}

// make a request to the giphy search api
const search = async (query: string, offset: number): Promise<GiphySearch> => {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${
        process.env['REACT_APP_GIPHY_API_KEY']
      }&q=${encodeURIComponent(
        query
      )}&limit=${PAGE_SIZE}&offset=${offset}&rating=G&lang=en`
    );
    return (await response.json()) as GiphySearch;
  } catch {
    return { data: [], pagination: { total_count: 0, count: 0, offset: 0 } };
  }
};

export type OnSelectedHandler = (gif: IGif, query: string) => void;

interface GifInputProps {
  onSelected: OnSelectedHandler;
}

const GiphyInput: React.FC<GifInputProps> = ({ onSelected }: GifInputProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const getNextPage: GetNextPage<IGif, GiphySearch['pagination'], string> =
    useCallback(async (prev, _total, query) => {
      // bail out
      const { data: results, pagination } = await search(
        query,
        prev ? prev.offset + prev.count : 0
      );
      return {
        results,
        pagination,
        pagesRemain:
          pagination.offset + pagination.count < pagination.total_count,
      };
    }, []);
  const isEnabled = debouncedQuery.length > 0;
  const {
    results,
    containerRef: picker,
    endRef: bottom,
    responseId: reset,
  } = usePagination(
    getNextPage,
    debouncedQuery,
    undefined,
    undefined,
    isEnabled
  );

  const curriedOnSelected = (gif: IGif) => onSelected(gif, query);

  return (
    <Dropdown
      icon={Icons.Giphy}
      right="0"
      bottom="0"
      title="Open gif selector"
      render={(dismiss) => {
        return (
          <StyledBox
            bg="backgrounds.panel"
            border="dark"
            borderRadius="light"
            padding="1"
            maxWidth="calc(100vw - 50px)"
            width="430px"
          >
            <Input
              placeholder="Search GIPHY"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              attribution={attribution}
            />
            <ScrollView height="400px" ref={picker}>
              {!query && (
                <GiphyMessagePlaceholder
                  placeholder={giphyMessagePlaceholders['empty']}
                />
              )}
              {query && results?.length === 0 && (
                <GiphyMessagePlaceholder
                  placeholder={giphyMessagePlaceholders['notFound']}
                />
              )}
              <StyledBox>
                {query && results && results.length > 0 && (
                  <GiphyMasonry
                    groupedItems={results || []}
                    reset={reset}
                    columns={2}
                    getSizeForItem={(i) => {
                      const item = i.images.fixed_width;
                      // workaround for https://github.com/Giphy/giphy-js/issues/126
                      return {
                        height: parseInt(item.height as unknown as string),
                        width: parseInt(item.width as unknown as string),
                      };
                    }}
                    render={(item, key) => (
                      <StyledBox
                        borderRadius="strong"
                        overflow="hidden"
                        marginTop="1"
                      >
                        <Gif
                          gif={item}
                          size={GifSize.Preview}
                          key={key}
                          container={picker}
                          onClick={(gif) => {
                            dismiss();

                            curriedOnSelected(gif);
                          }}
                        />
                      </StyledBox>
                    )}
                  />
                )}
              </StyledBox>
              <div ref={bottom} />
            </ScrollView>
          </StyledBox>
        );
      }}
    />
  );
};

export default GiphyInput;
