import {render,screen} from '@testing-library/react';
import {describe,it,expect} from 'vitest';
import {DeskContext,useDesk} from '@/features/desk-context';

describe('Shared desk context identity',()=>{
 it('reads the enclosing provider instead of creating a separate account context',()=>{
  const value={name:'Context regression check'} as NonNullable<React.ContextType<typeof DeskContext>>;
  function Consumer(){return <span>{useDesk().name}</span>;}
  render(<DeskContext.Provider value={value}><Consumer/></DeskContext.Provider>);
  expect(screen.getByText('Context regression check')).toBeInTheDocument();
 });
});